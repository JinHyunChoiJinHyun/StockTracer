import time
import logging
from datetime import datetime, timedelta

import pandas as pd
import FinanceDataReader as fdr
import requests

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) #?

# 백엔드 API 설정
BACKEND_BASE_URL = "http://localhost:8080"  # 실제 백엔드 주소로 교체
STOCK_INFO_ENDPOINT = f"{BACKEND_BASE_URL}/api/v1/stocks/info"
STOCK_PRICE_ENDPOINT = f"{BACKEND_BASE_URL}/api/v1/stocks/prices/bulk"

# 통신 설정
retry_count = 3
request_timeout = 5

# 1. 백엔드로 POST
def post_with_retry(url:str, paylaod) -> bool:
    for attempt in range(1, retry_count+1):
        try:
            res = requests.post(url, json=paylaod, timeout=request_timeout)
            res.raise_for_status()
            return True
        except requests.RequestException as e:
            logger.warning("POST 실패 (%d번째 시도) url=%s error=%s", attempt, url, e)
    logger.error("POST 최종 실패: url=%s", url)
    return False

# 2-1. 상위 종목 추출 함수
def get_top_market_cap_stocks(limit=50):
    logger.info("KRX 시가총액 상위 %d개 종목 목록 추출 중...", limit)

    # 1) KRX 전체 상장 종목 정보 불러오기
    df_krx = fdr.StockListing("KRX")

    # 2) 상위 종목 선택
    top_stock = df_krx.head(limit)[["Code","Name","Market"]]

    # 3) 데이터 전처리
    # KOSDAQ GLOBAL -> KOSDAQ으로 변환
    top_stock["Market"] = top_stock["Market"].replace("KOSDAQ GLOBAL", "KOSDAQ")
    print(top_stock['Market'].unique())
# 출력 결과에 'KOSDAQ GLOBAL'이 여전히 남아있다면 전처리(재할당) 코드가 적용되지 않은 것입니다.
    # dict로 변환
    return top_stock.to_dict(orient="records")

# 2-2 상위 종목 백엔드 전송 함수
def save_stock_info(target_stocks):
    # 1) 상위 종목 전송
    logger.info("종목 정보 전송 중...")
    payload = [
        {
            "stock_code": s["Code"],
            "stock_name": s["Name"],
            "market": s["Market"]
        }
        for s in target_stocks
    ]
    if post_with_retry(STOCK_INFO_ENDPOINT, payload):
        logger.info("%d개 종목 정보 전송 완료", len(target_stocks))
    else:
        logger.error("[stock_info] 전송 실패")
        raise RuntimeError("종목 정보 백엔드 전송 실패")

# 2-3. 상위 종목 일봉 데이터 수집 후 db 저장 함수
def get_and_save_stock_prices(target_stocks, start_date="2026-01-01"):
    total = len(target_stocks)
    success_count, fail_count = 0, 0
    
    # 1) 순회하며 주가 수집 및 저장
    for idx, stock in enumerate(target_stocks,1):
        code = stock["Code"]
        name = stock["Name"]
        payload = []
        try:
            logger.info("[%d/%d] %s(%s) 수집 중...", idx, total, name, code)

            # 주가 데이터 수집
            df_price = fdr.DataReader(code,start_date)

            if df_price.empty:
                continue

            # 전처리 (애초에 df로 반환되고 벡터 연산이 필요하므로 pandas로 처리)
            df_price = df_price.reset_index() # index도 rename 해야하므로
            df_price.rename(columns={
                "Date": "stock_date",
                "Open": "open_price",
                "High": "high_price",
                "Low": "low_price",
                "Close": "close_price",
                "Volume": "volume",
                "Change": "price_change"
            }, inplace=True)

            # 외래키 추가
            df_price["stock_code"] = code

            # json 직렬화를 위해 날짜 -> 문자열로 변환 (json은 날짜 타입 없음)
            df_price["stock_date"] = df_price["stock_date"].dt.strftime("%Y-%m-%d")

            # 컬럼 순서 정리
            cols=["stock_code","stock_date","open_price","high_price","low_price","close_price","volume","price_change"]
            df_price = df_price[cols]

            # 백엔드로 전송 (종목당 전체 기간 데이터를 리스트에 담아 배치로 한번에 전송)
            payload = df_price.to_dict(orient="records")
            body = {"prices": payload}
            if post_with_retry(STOCK_PRICE_ENDPOINT, body):
                success_count += 1
            else:
                fail_count += 1
                logger.error("[%s(%s)] 주가 전송 실패", name, code)

        except Exception as e:
            fail_count += 1
            logger.error("[%s(%s)] 수집 실패: %s - %s", name, code, type(e).__name__, e)
            continue
        finally:
            # IP 차단 방지
            time.sleep(0.3)

    logger.info("전체 완료 - 성공 %d건 / 실패 %d건 (총 %d건)", success_count, fail_count, total)

# 3. main 실행
if __name__ == "__main__":
    target_stocks = get_top_market_cap_stocks()
    save_stock_info(target_stocks)
    start_date = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
    get_and_save_stock_prices(target_stocks,start_date=start_date)


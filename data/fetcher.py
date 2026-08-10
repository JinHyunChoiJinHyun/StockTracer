import time
import logging
from datetime import datetime, timedelta

import pandas as pd
import FinanceDataReader as fdr

# .\venv\Scripts\Activate.ps1
# >> 가상환경 실행 코드 (venv 폴더 내 스크립트 실행)

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) #?

# 상위 종목 추출 함수
def get_top_stocks(limit=50):
    logger.info("KRX 시가총액 상위 %d개 종목 목록 추출 중...", limit)

    # 1) KRX 전체 상장 종목 정보 불러오기
    df_krx = fdr.StockListing("KRX")

    # 2) 상위 종목 선택
    df_top_stock = df_krx.head(limit)[["Code","Name","Market"]]

    # 3) 데이터 전처리
    # KOSDAQ GLOBAL -> KOSDAQ으로 변환
    df_top_stock["Market"] = df_top_stock["Market"].replace("KOSDAQ GLOBAL", "KOSDAQ")
    
    # dict로 변환
    df_top_stock.to_dict(orient="records")

    return [
            {
                "stock_code": s["Code"],
                "stock_name": s["Name"],
                "market": s["Market"]
            }
            for s in df_top_stock
        ]

# 상위 종목 일봉 데이터 수집
def get_stock_prices(stocks, start_date=None):
    if start_date is None:
        start_date = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")

    total = len(stocks)
    success_count, fail_count = 0, 0
    
    # 1) 순회하며 주가 수집 및 저장
    price_payload = {"prices":[]}
    for idx, stock in enumerate(stocks,1):
        code = stock["Code"]
        name = stock["Name"]
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

            # payload에 적재
            price_payload["prices"].extend(df_price.to_dict(orient="records")) # append 사용 시 배열 내 배열이 추가되므로 extend로 사용

            success_count += 1
        except Exception as e:
            fail_count += 1
            logger.error("[%s(%s)] 수집 실패: %s - %s", name, code, type(e).__name__, e)
            continue
        finally:
            # IP 차단 방지
            time.sleep(0.3)

    logger.info("전체 완료 - 성공 %d건 / 실패 %d건 (총 %d건)", success_count, fail_count, total)

    # 2) 전체 데이터 반환
    return price_payload




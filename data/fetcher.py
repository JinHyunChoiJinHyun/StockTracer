# fetcher => 수집 및 전처리

import logging, dotenv

import pandas as pd
from pykrx import stock
import FinanceDataReader as fdr # 추후 확장성을 위해 사용

# .\venv\Scripts\Activate.ps1
# >> 가상환경 실행 코드 (venv 폴더 내 스크립트 실행)

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) 

# 상위 종목 원본 데이터 수집
def fetch_stocks() -> pd.DataFrame:
    logger.info("KRX 시장 데이터 수집 시작...")
    dotenv.load_dotenv()

    # 1) KRX 상위 종목 정보 불러오기
    df_master = fdr.StockListing("KRX") # 시가총액이 큰 순으로 조회

    # 2) 데이터 전처리
    # KOSDAQ GLOBAL -> KOSDAQ으로 변환
    df_master["Market"] = df_master["Market"].replace("KOSDAQ GLOBAL", "KOSDAQ")

    return df_master

# 상위 종목 일봉 데이터 수집
def fetch_prices(date: str) -> pd.DataFrame:
    logger.info("%s KRX 시장 주가 데이터 수집 시작...", date)
    try:
        df_price = stock.get_market_ohlcv_by_ticker(date, market="ALL") # 코드를 기준으로 결과 나열 (날짜는 하나로 고정)
        return df_price.reset_index() # index 값을 필드로 이동
    except Exception as e:
        logger.warning("%s 가격 조회 실패 (휴장일 추정): %s", date, e)
        return pd.DataFrame() # 빈 df 반환

# 외국인/기관 투자 데이터 수집
def fetch_investor_trading_volume(date:str, market="ALL") -> pd.DataFrame:
    investors = ["외국인", "기관합계", "개인"]
    df_list = []

    logger.info("%s KRX 시장 외국인/기관 투자 데이터 수집 시작...", date)
    for investor in investors:
        try:
            df = stock.get_market_net_purchases_of_equities(date, date, market, investor)

            # 데이터가 존재하지 않을 시
            if df.empty:
                logger.warning("%s %s 조회 결과가 없습니다", date, investor)
                continue # 다른 investor 조회로 이동

            df["investor_type"] = investor
            df_list.append(df)
            
        except Exception as e:
            logger.warning("%s 데이터 수집 중 오류 발생: %s", date, e)

    # 모든 investor 수집 후에도 데이터가 없을 시
    if not df_list:
        logger.warning("%s 수집된 데이터가 없습니다.", date)
        return pd.DataFrame()

    # 데이터 병합
    df_trading = pd.concat(df_list)

    return df_trading.reset_index()




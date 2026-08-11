# fetcher => 수집 및 전처리

import time, logging
from datetime import datetime, timedelta

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

    # 1) KRX 상위 종목 정보 불러오기
    df_master = fdr.StockListing("KRX") # 시가총액이 큰 순으로 조회

    # 2) 데이터 전처리
    # KOSDAQ GLOBAL -> KOSDAQ으로 변환
    df_master["Market"] = df_master["Market"].replace("KOSDAQ GLOBAL", "KOSDAQ")

    return df_master

# 상위 종목 일봉 데이터 수집
def fetch_prices(date) -> pd.DataFrame:
    logger.info("%s KRX 시장 주가 데이터 수집 시작...", date)
    try:
        df_price = stock.get_market_ohlcv_by_ticker(date, market="ALL") # 코드를 기준으로 결과 나열 (날짜는 하나로 고정)
        return df_price.reset_index() # index 값을 필드로 이동
    except Exception as e:
        logger.warning("%s 가격 조회 실패 (휴장일 추정): %s", date, e)
        return pd.DataFrame() # 빈 df 반환





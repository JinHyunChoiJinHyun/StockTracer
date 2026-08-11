# 저평가된 주식
import os,logging
from dotenv import  load_dotenv
from pykrx import stock

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) 

# 주식 종목 분석
def analyze_stocks(df):
    logger.info("KRX 시장 종목 목록 추출 중...")

    # 1) 종목 필드 추출
    df_top_stock = df[["Code","Name","Market"]].copy()

    return df_top_stock

def analyze_prices(df, date):
    logger.info("%s KRX 시장 주가 데이터 추출 중...", date)

    # 1) 주가 필드 추출
    df_prices = df[["티커","시가","고가","저가","종가","거래량","거래대금","등락률","시가총액"]].copy()

    # 2) 날짜 필드 추가
    df_prices["날짜"] = date

    return df_prices

def analyze_fundamenta():
    # load_dotenv()

    # 1. 20260810 대신 확실히 데이터가 있는 '최근 과거 평일' 날짜를 입력하세요.
    # 예시: 2024년 5월 20일 (월요일)
    target_date = "20240520" 

    # 2. 코스피 데이터 조회 (market 파라미터를 명시해 주는 것이 좋습니다)
    df_fund = stock.get_market_fundamental(target_date, market="ALL")
    df_cap = stock.get_market_cap(target_date, market="ALL")

    print(df_cap.head())

# 외국인/기관 순매수 top 5

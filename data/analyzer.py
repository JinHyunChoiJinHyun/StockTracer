# 저평가된 주식
import os,logging
import pandas as pd
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
    df_prices["날짜"] = f"{date[:4]}-{date[4:6]}-{date[6:]}"

    # 3) 이상치 제거
    before = len(df_prices)
    
    # 이상치 판별 (True: 이상치, False: 정상)
    invalid_mask = (
        (df_prices['시가'] <= 0) |  # 시가 0인 경우 제거
        (df_prices['고가'] <= 0) |  # 고가 0인 경우 제거
        (df_prices['저가'] <= 0) |  # 저가 0인 경우 제거
        (df_prices['종가'] <= 0)|  # 종가 0인 경우 제거
        (df_prices['시가총액'] <= 0)  # 시가총액 0인 경우 제거
     ) # 한번에 필터링하여 효율 증가

    # 제거될 row log 출력
    if invalid_mask.any(): # True인 값이 하나라도 존재하면
        invalid_rows = df_prices[invalid_mask]
        logger.warning(f"OHLC 결측 데이터 {len(invalid_rows)}건 제거: "
                    f"{invalid_rows[['티커', '날짜']].to_dict('records')}")

    # 정상 row만 저장 (~: not 연산자)
    df_prices = df_prices[~invalid_mask] 

    # 결과 log 출력
    logger.info(f"이상치 제거: {before}건 -> {len(df_prices)}건")
    
    return df_prices

# 외국인/기관 순매수 분석
def analyze_investor_trading_volume(df:pd.DataFrame):
    # 1. 피벗 생성
    pivot_df = df.pivot_table(
        index = ["티커", "품목명"],
        columns="investor_type", # 값이 필드명으로 변환됨
        values="순매수거래대금",
        aggfunc="sum" # 여러 날짜가 들어갈 경우 데이터가 뭉개질 우려가 있어 평균이 아닌 합계 사용
    ).reset_index()

    # 2. 누락된 investor 컬럼 방어 및 NaN 값 0으로 처리 (컬럼이 누락될 경우 참조 오류 발생)
    for col in ("외국인", "기관합계", "개인"):
        if col not in pivot_df.columns:
            pivot_df[col] = 0
    pivot_df[["외국인", "기관합계", "개인"]] = pivot_df[["외국인", "기관합계", "개인"]].fillna(0)

    # 3. 쌍끌이 매수 여부 (외국인 + 기관 동시 매수)
    pivot_df["is_double_buy"] = (pivot_df["외국인"] > 0) & (pivot_df["기관합계"] > 0)

    # 4. 메이저 합산 순매수 금액 (시장에 돈이 얼마나 들어왔는지)
    pivot_df["major_net_amount"] = pivot_df["외국인"] + pivot_df["기관합계"]





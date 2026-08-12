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
def analyze_investor_trading_volume(df:pd.DataFrame, date: str) -> pd.DataFrame:

    # 상수
    INVESTORS = ["외국인", "기관합계", "개인"]

    # 한글 컬럼 정규화
    RENAME = {
        "외국인": "foreign_net",
        "기관합계": "institution_net",
        "개인": "individual_net",
    }

    REQUIRED_COLUMNS = {"날짜", "티커", "종목명", "investor_type", "순매수거래대금"}

    # 1. 입력값 검증
    # 컬럼 누락 확인
    missing = REQUIRED_COLUMNS - set(df.columns) # 차집합
    if missing:
        raise ValueError(f"필수 컬럼 누락: {sorted(missing)}")

    # 날짜 데이터 여부 확인
    today_df = df[df["날짜"] == date].copy()
    if today_df.empty:
        raise ValueError(f"{date} 수급 데이터가 없습니다 (휴장일 여부 확인)")

    # 중복 감지 시 첫 행 제외한 나머지 제거
    dup_key = ["티커", "investor_type"]
    dup_mask = today_df.duplicated(subset=dup_key, keep=False)
    if dup_mask.any():
        logger.warning(
            "%s 중복 행 %d건 감지 (티커 %d개). 첫 행만 사용합니다: %s",
            date,
            int(dup_mask.sum()), # true(1)인 값의 합계 (len으로 계산 시 false 갯수도 포함됨)
            today_df.loc[dup_mask, "티커"].nunique(),
            today_df.loc[dup_mask, "티커"].unique()[:5].tolist()
        )
        today_df = today_df.drop_duplicates(subset=dup_key, keep="first")

    # 타입 정규화
    today_df["티커"] = today_df["티커"].astype(str).str.zfill(6) # 코드 6자리 문자열로 고정 (0 손실 방지)
    today_df["순매수거래대금"] = pd.to_numeric( # 결측치 0으로 대체
        today_df["순매수거래대금"], errors="coerce"
    ).fillna(0.0)

    # 2. 피벗 생성
    pivot_df = df.pivot_table(
        index = ["티커", "종목명"],
        columns="investor_type", # 값이 필드명으로 변환됨
        values="순매수거래대금",
        aggfunc="first" # 중복 제거 후 첫번째 행 값만 사용
    ).reset_index()
    pivot_df.columns.name = None # 깔끔한 표 모양 반환

    # 누락된 investor 컬럼 방어 및 NaN 값 0으로 처리 (컬럼이 누락될 경우 참조 오류 발생)
    for col in INVESTORS:
        if col not in pivot_df.columns:
            logger.warning("%s 투자자 구분 '%s' 누락 → 0으로 채움", date, col)
            pivot_df[col] = 0.0
    pivot_df[INVESTORS] = pivot_df[INVESTORS].fillna(0.0)
    pivot_df = pivot_df.rename(columns=RENAME)

    # 2. 파생 지표
    # 메이저 합산 순매수 금액 (시장에 돈이 얼마나 들어왔는지)
    pivot_df["major_net_amount"] = pivot_df["외국인"] + pivot_df["기관합계"]

    # 쌍끌이 매수 여부 (외국인 + 기관 동시 매수)
    MIN_BUY_AMOUNT = 1e8 # 자투리 매매 혹은 기계적 물량을 걷어내고 강력한 매수 필터를 위해 1억 이상으로 설정
    pivot_df["is_double_buy"] = (pivot_df["외국인"] > MIN_BUY_AMOUNT) & (pivot_df["기관합계"] > MIN_BUY_AMOUNT)

    # 손바뀜 구간 계산 (개인이 매도하며 상승 확률 증가) -> 개인 투자자의 물랴은 주가 상승을 방해하는 저항 또는 노이즈로 해석됨
    pivot_df["is_clean_buy"] = pivot_df["is_double_buy"] & (pivot_df["개인"] < 0)

    # 전체 거래대금 중 가장 큰 값 추출 (db에서 값 불러오기)
    if "거래대금" in today_df.columns: # 컬럼 삭제 시 에러 방지
        turnover = (
            today_df.groupby("티커")["거래대금"].max()
        )
    





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
    raw_df = fdr.StockListing("KRX") # 시가총액이 큰 순으로 조회

    # 2) 데이터 전처리
    # KOSDAQ GLOBAL -> KOSDAQ으로 변환
    raw_df["Market"] = raw_df["Market"].replace("KOSDAQ GLOBAL", "KOSDAQ")

    # 3) 필요한 컬럼 추출
    df_master = raw_df[["Code","Name","Market"]].copy()

    return df_master

# 상위 종목 일봉 데이터 수집
def fetch_prices(date: str) -> pd.DataFrame:
    logger.info("%s KRX 시장 주가 데이터 수집 시작...", date)
    try:
        raw_df = stock.get_market_ohlcv_by_ticker(date, market="ALL") # 코드를 기준으로 결과 나열 (날짜는 하나로 고정)

        # 필요한 컬럼 추출
        raw_df = raw_df.reset_index()
        df_price = raw_df[["티커","시가","고가","저가","종가","거래량","거래대금","등락률","시가총액"]].copy()

        # 날짜 필드 추가
        df_price["날짜"] = f"{date[:4]}-{date[4:6]}-{date[6:]}"
    
        # 이상치 제거
        before = len(df_price)
        
        # 이상치 판별 (True: 이상치, False: 정상)
        invalid_mask = (
            (df_price['시가'] <= 0) |  # 시가 0인 경우 제거
            (df_price['고가'] <= 0) |  # 고가 0인 경우 제거
            (df_price['저가'] <= 0) |  # 저가 0인 경우 제거
            (df_price['종가'] <= 0)|  # 종가 0인 경우 제거
            (df_price['시가총액'] <= 0)  # 시가총액 0인 경우 제거
            ) # 한번에 필터링하여 효율 증가
    
        # 제거될 row log 출력
        if invalid_mask.any(): # True인 값이 하나라도 존재하면
            invalid_rows = df_price[invalid_mask]
            logger.warning(f"OHLC 결측 데이터 {len(invalid_rows)}건 제거: "
                        f"{invalid_rows[['티커', '날짜']].to_dict('records')}")
    
        # 정상 row만 저장 (~: not 연산자)
        df_price = df_price[~invalid_mask] 
    
        # 결과 log 출력
        logger.info(f"이상치 제거: {before}건 -> {len(df_price)}건")

        # 타입 정규화
        df_price["티커"] = df_price["티커"].astype(str).str.zfill(6) # 코드 6자리 문자열로 고정 (0 손실 방지)

        return df_price.reset_index() # index 값을 필드로 이동
    
    except Exception as e:
        logger.warning("%s 가격 조회 실패 (휴장일 추정): %s", date, e)
        return pd.DataFrame() # 빈 df 반환

# 외국인/기관 투자 데이터 수집
def fetch_investor_flow(date:str, market="ALL") -> pd.DataFrame:
    investors = ["외국인", "기관합계", "개인"]
    df_list: list[pd.DataFrame] = []

    logger.info("%s KRX 시장 외국인/기관 투자 데이터 수집 시작...", date)
    for investor in investors:
        try:
            raw_df = stock.get_market_net_purchases_of_equities(date, date, market, investor)
            raw_df = raw_df.reset_index() # index 컬럼으로 이동

            # 데이터가 존재하지 않을 시
            if raw_df.empty:
                logger.warning("%s %s 조회 결과가 없습니다", date, investor)
                continue # 다른 investor 조회로 이동

            # 컬럼 추가
            raw_df["investor_type"] = investor
            raw_df["base_date"] = date
            
            df_list.append(raw_df)
            
        except Exception as e:
            logger.warning("%s 데이터 수집 중 오류 발생: %s", date, e)

    # 모든 investor 수집 후에도 데이터가 없을 시
    if not df_list:
        logger.warning("%s 수집된 데이터가 없습니다.", date)
        return pd.DataFrame()

    # 데이터 병합
    combined_df = pd.concat(df_list, ignore_index=True)

    REQUIRED_COLUMNS = {"base_date", "티커", "종목명", "investor_type", "순매수거래대금"}

    # 컬럼 누락 확인
    missing = REQUIRED_COLUMNS - set(combined_df.columns) # 차집합
    if missing:
        raise ValueError(f"필수 컬럼 누락: {sorted(missing)}")

    # 날짜 데이터 여부 확인
    today_df = combined_df[combined_df["base_date"] == date].copy()
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

    return today_df.reset_index()




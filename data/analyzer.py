# 저평가된 주식
import os,logging
import pandas as pd
import numpy as np
from dotenv import  load_dotenv
from pykrx import stock

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) 

# 주식 종목 분석
# def analyze_stocks(df):
#     logger.info("KRX 시장 종목 목록 추출 중...")

#     return 

# def analyze_prices(df, date):
#     logger.info("%s KRX 시장 주가 데이터 추출 중...", date)
        
#     return 

# 외국인/기관 순매수 원본 데이터
def build_investor_flow(df:pd.DataFrame, df_price:pd.DataFrame) -> pd.DataFrame:
    # 상수
    INVESTORS = ["외국인", "기관합계", "개인"]

    # 입력값 검증
    # 값 존재 여부 확인
    if df.empty:
        raise ValueError("수급 데이터가 비어 있습니다 (휴장일 여부 확인)")

   
    
    # 1. 피벗 생성
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
            logger.warning("투자자 구분 '%s' 누락 → 0으로 채움", col)
            pivot_df[col] = 0.0
    pivot_df[INVESTORS] = pivot_df[INVESTORS].fillna(0.0)
    pivot_df = pivot_df.rename(columns={
            "외국인": "foreign_net",
            "기관합계": "institution_net",
            "개인": "individual_net",
        })

    
    if "거래대금" not in df_price.columns:
        # 거래대금 컬럼 없는 경우 중단
        raise ValueError("df_price에 '거래대금' 컬럼이 없습니다")

    # 거래대금 피벗에 합치기
    pivot_df = pivot_df.merge(df_price[["티커","거래대금"]], on="티커", how="left")

    # 매칭 실패율이 일정 % 이상일 시 중단
    unmatched = pivot_df["거래대금"].isna().sum()
    unmatched_ratio = unmatched / len(pivot_df)

    if unmatched_ratio > 0.1:
        raise ValueError(
            f"시세 매칭 실패율 {unmatched_ratio:.1%} ({unmatched}/{len(pivot_df)}). "
            f"티커 형식 또는 시장 구분 불일치 가능성. 예시: "
            f"{pivot_df.loc[pivot_df['거래대금'].isna(), '티커'].head(5).tolist()}"
        )

    # 매칭 실패율이 일정 % 이하일 시 매칭 실패건 출력 후 분석 진행
    if unmatched:
        logger.warning("시세 매칭 실패 %d건 (%.1f%%)", unmatched, unmatched_ratio * 100)

    # 컬럼명 바꾸기
    pivot_df = pivot_df.rename(columns={"티커": "stock_code", "거래대금": "trading_value"})

    return pivot_df[["stock_code", "base_date", "foreign_net",
                     "institution_net", "individual_net", "trading_value"]]
    
# 외국인/기관 순매수 분석
def analyze_investor_flow(flow_df:pd.DataFrame) -> pd.DataFrame:

     # 하루치 날짜만 입력되었는지 확인
    dates = df["base_date"].unique()
    if len(dates) > 1:
        raise ValueError(f"단일 일자만 처리합니다. 입력된 날짜: {sorted(dates)}")
    base_date = dates[0]

    # 유동성 필터 (거래대금이 너무 작으면 수급 해석 자체가 무의미)
    before = len(flow_df)
    MIN_TRADING_VALUE = 5e8 # 거래대금 5억 미만 종목은 유동성 부족
    df = flow_df[flow_df["거래대금"] >= MIN_TRADING_VALUE].copy() # 결측치 자동 제외
    logger.info("유동성 필터로 %d개 제외 (잔여 %d개)", before - len(df), len(df))
    
    # 파생 지표 분석
    # 메이저 합산 순매수 금액 (시장에 돈이 얼마나 들어왔는지)
    df["major_net"] = df["foreign_net"] + df["institution_net"]

    # 쌍끌이 매수 여부 (외국인 + 기관 동시 매수)
    MIN_BUY_AMOUNT = 1e8 # 자투리 매매 혹은 기계적 물량을 걷어내고 강력한 매수 필터를 위해 1억 이상으로 설정
    df["is_double_buy"] = (df["foreign_net"] > MIN_BUY_AMOUNT) & (df["institution_net"] > MIN_BUY_AMOUNT)

    # 손바뀜: 쌍끌이 + 개인 순매도 (개인 물량이 저항으로 남지 않는 구간)
    df["is_clean_buy"] = df["is_double_buy"] & (df["individual_net"] < 0)

    # 순매수 강도 - 거래대금을 %로 변환해 절대금액의 대형주 편향 제거
    df["net_ratio"] = np.where( # 조건문 
        df["trading_value"] > 0, # 거래대금이 0보다 클 시
        df["major_net"] / df["trading_value"], # true일 시 거래대금 %로 변환
        np.nan # false일 시 nan으로 대체
    )

    # 3. 점수화
    df["score"] = _calculate_score(df)

    # 4. 프론트 표시용 필드
    df["foreign_net_eok"] = _to_eok(df["foreign_net"])
    df["institution_net_eok"] = _to_eok(df["institution_net"])
    df["individual_net_eok"] = _to_eok(df["individual_net"])
    df["major_net_eok"] = _to_eok(df["major_net"])
    df["reason"] = df.apply(_build_reason, axis=1) if len(df) else pd.Series(dtype="object") # df에 값이 있으면 apply로 한줄씩 함수에 입력 / 없으면 빈 series 반환 -> 빈 df로 인한 ValueError 방지
    df["base_date"] = base_date # df에 있지 않나?

    final_df = flow_df.drop(columns=["foreign_net", "institution_net", "individual_net", "major_net"])

    logger.info("%s 수급 분석 완료", base_date)

    return final_df


# 순매수 점수 계산
def _calculate_score(df:pd.DataFrame) -> pd.Series:
    """
        절대금액과 상대강도를 나누는 것이 핵심
        -> 한쪽만 사용할 시 대형주 편향 또는 품질주 노이즈에 끌려감
    """

    # 금액 순위 백분위 (0~45점) -> 절대 금액 크기 계산 (얼마나 많은 현금을 넣었는가)
    amount_score = df["major_net"].where(df["major_net"] > 0).rank(pct=True).fillna(0.0) * 45 # 양수면 크기 순으로 rank 음수면 0

    # 강도 순위 백분위 (0~25점) -> 전체 거래대금 대비 순매수 비율 (메이저 세력이 몇 % 독식했는가)
    if df["net_ratio"].notna().any():
        ratio_score = df["net_ratio"].where(df["major_net"] > 0).rank(pct=True).fillna(0.0) * 25
    else:
        # 거래대금이 없으면 금액 점수로 대체 배분 (45로 나눠서 정규화 후 곱셈)
        ratio_score = amount_score / 45 * 25

    # 수급 주체 조합 (0~30점) -> 쌍끌이 (메이저 투자자가 들어왔는지) + 손바뀜 (개인 투자자가 빠져나갔는지)
    combo_score = (
        df["is_double_buy"].astype(int) * 20 + df["is_clean_buy"].astype(int) * 10
    )

    return (amount_score + ratio_score + combo_score).round().clip(0,100).astype(int) # clip -> 범위 내에서 숫자 반환

# 프론트 표기 
EOK = 1e8 

# 단위 매핑 (원 -> 억원)
def _to_eok(series:pd.Series) -> pd.Series:
    return (series / EOK ).round(1)

# 근거
def _build_reason(row: pd.Series) -> str:
    """프론트에 그대로 노출되는 한 줄 근거. 초보자 기준으로 용어를 풀어 쓴다."""
    foreign = row["foreign_net"] / EOK
    inst = row["institution_net"] / EOK
 
    if row["is_clean_buy"]:
        return "외국인과 기관이 함께 담았고 개인은 팔았어요. 물량이 넘어가는 구간입니다."
    if row["is_double_buy"]:
        return f"외국인 {foreign:,.0f}억, 기관 {inst:,.0f}억을 같은 날 함께 사들였어요."
    if foreign > 0 >= inst:
        return f"외국인이 {foreign:,.0f}억 사들였지만 기관은 팔고 있어요. 방향이 엇갈립니다."
    if inst > 0 >= foreign:
        return f"기관이 {inst:,.0f}억 담았어요. 외국인 매수는 아직 붙지 않았습니다."
    return f"외국인·기관 합쳐 {row['major_net'] / EOK:,.0f}억이 들어왔어요."


    

# 저평가된 주식
import os,logging
import pandas as pd
import numpy as np
from dotenv import  load_dotenv
from pykrx import stock
from dataclasses import dataclass

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
    
    # 하루치 날짜만 입력되었는지 확인
    dates = df["base_date"].unique()
    if len(dates) > 1:
        raise ValueError(f"단일 일자만 처리합니다. 입력된 날짜: {sorted(dates)}")
    base_date = dates[0]
    
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
    pivot_df["base_date"] = base_date

    return pivot_df[["stock_code", "base_date", "foreign_net",
                     "institution_net", "individual_net", "trading_value"]]
    
# 외국인/기관 순매수 분석
def analyze_investor_flow(flow_df:pd.DataFrame) -> pd.DataFrame:

    # 유동성 필터 (거래대금이 너무 작으면 수급 해석 자체가 무의미)
    before = len(flow_df)
    MIN_TRADING_VALUE = 5e8 # 거래대금 5억 미만 종목은 유동성 부족
    df = flow_df[flow_df["trading_value"] >= MIN_TRADING_VALUE].copy() # 결측치 자동 제외
    logger.info("유동성 필터로 %d개 제외 (잔여 %d개)", before - len(df), len(df))

    if df.empty:
        return df
    
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

    # 반올림 처리 (소수점 길어짐 방지)
    df["net_ratio"] = df["net_ratio"].round(6)

    # 점수화
    df["score"] = _calculate_score(df)

    # 근거 입력
    df["reason"] = df.apply(_build_reason, axis=1) # df에 값이 있으면 apply로 한줄씩 함수에 입력 / 행이 하나라도 있으면 오류 반환 x

    logger.info("%s 수급 분석 완료", df["base_date"].iloc[0])

    PAYLOAD_COLS = [
        "stock_code", 
        "base_date", 
        "net_ratio", 
        "score",
        "is_double_buy", 
        "is_clean_buy", 
        "reason"
        ]

    return df[PAYLOAD_COLS]


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

# 근거
EOK = 1e8 
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

""" 저평가 종목 분석 """
# 저평가 종목 설정값
@dataclass(frozen=True)
class ValueConfig:
    min_market_cap: int = 50_000_000_000 # 최소 시가총액: 500억
    min_trading_value: int = 500_000_000 # 최소 거래대금: 5억
    min_sector_size: int = 15 # 업종 표본 하한 (표본이 적으면 업종이 아닌 전체 시장 기준 백분위)
    per_weight: float = 0.5 # per 가중치
    pbr_weight: float = 0.5 # pbr 가중치
    exclude_preferred: bool = True # 우선주 제외 여부

    def __post_init__(self) -> None:
        # 가중치 합 검증 (가중치의 합은 무조건 100%)
        total = self.per_weight + self.pbr_weight
        if not np.isclose(total, 1.0):
            raise ValueError(f"per_weight + pbr_weight 는 1.0 이어야 합니다: {total}")

# 분석 대상 필터
def filter_fundamental(df:pd.DataFrame, cfg: ValueConfig) -> pd.DataFrame:
    before = len(df)

    # 의미없는 값 리스트 저장
    steps: list[tuple[str, pd.Series]] = [
        # 적자 기업 제외
        ("per<=0 또는 결측", df["per"].gt(0).fillna(False)), # 0보다 크면 true 아니면 false
        ("pbr<=0 또는 결측", df["pbr"].gt(0).fillna(False)),
        ("시총 미달", df["market_cap"].ge(cfg.min_market_cap).fillna(False)),
        ("거래대금 미달", df["trading_value"].ge(cfg.min_trading_value).fillna(False))
    ]

    # 우선주 배제
    if cfg.exclude_preferred:
        steps.append(("우선주", df["stock_code"].str.endswith("0"))) # 보통주는 끝자리가 0이므로 보통주만 true로 저장 (우선주는 false로 저장)

    # 각 조건으로 필터
    mask = pd.Series(True, index=df.index) # 조건 통과 여부를 저장할 변수
    for label, condition in steps: 
        dropped = int((mask & ~condition).sum()) # 현재 조건을 통과하지 못한 종목 수 합계 계산
        if dropped:
            logger.info("제외 [%s]: %d건", label, dropped)
        mask &= condition # mask와 condition 상태를 비교하여 true인 경우만 mask에 저장

    """
        mask 없이 필터링 시 (위 과정과 동일)

        df = df[df["market_cap"].ge(cfg.min_market_cap).fillna(False)]
    
        df = df[df["trading_value"].ge(cfg.min_trading_value).fillna(False)]
    
        df = df[df["per"].gt(0).fillna(False)]
        
    """

    filter_df = df[mask].copy()

    logger.info("확정: %d -> %d", before, len(filter_df))

    if filter_df.empty:
            raise ValueError("필터 결과가 비었습니다. ValueConfig 임계값을 확인하세요.")

    return filter_df

# 백분위 변환
def _percentile(df: pd.DataFrame, column: str, cfg: ValueConfig) -> tuple[pd.Series, pd.Series]:
    """ 절대평가 시 특정 분야로만 채워지므로 상대평가 필요"""
    market_pct = df[column].rank(pct=True, method="average") # 전체 백분위 계산

    # null이 아닌 행 존재 여부 확인
    has_sector = df["sector"].notna()

    # sector 필드값이 하나도 존재하지 않을 시(모든 행이 다 null일 시)
    if not has_sector.any(): 
        return market_pct, pd.Series("market", index=df.index)

    # sector 필드값이 하나라도 존재할 시
    sector_pct = df.groupby("sector")[column].rank(pct=True, method="average") # sector별 백분위 계산
    sector_size = df.groupby("sector")[column].transform("size") # sector 갯수 계산

    # sector 기준 백분위 적용 여부 결정
    use_sector = has_sector & sector_size.ge(cfg.min_sector_size) # 유효한 sector 계산
    pct = sector_pct.where(use_sector, market_pct) # sector가 유효할 시 sector_pct 사용, 아니라면 market_pct 사용
    scope = pd.Series(np.where(use_sector, "sector", "market"), index = df.index) # true면 전자, false면 후자를 필드값으로 삽입

    return pct, scope

# 분석 대상 점수화
def score_value(df: pd.DataFrame, cfg:ValueConfig) -> pd.DataFrame:
    pct_df = df.copy()
    per_pct, per_scope = _percentile(pct_df, "per", cfg)
    pbr_pct, _ = _percentile(pct_df, "pbr", cfg) # pbr_scope는 per_scope와 동일하므로 반환 x

    pct_df["per_pct"] = per_pct.round(4)
    pct_df["pbr_pct"] = pbr_pct.round(4)
    pct_df["scored_scope"] = per_scope # 백분위 계산 기준
    pct_df["value_score"] = (
        ((1 - per_pct) * cfg.per_weight + (1 - pbr_pct) * cfg.pbr_weight) * 100
    ).round(2) # 가중치 계산 (높을수록 상대적으로 저평가)

    return pct_df

# 저평가 이유 판정 (실적이 좋은데 저평가인지 아니면 진짜 실적이 안좋은건지)
def flag_value_trap(df:pd.DataFrame) -> pd.DataFrame:
    eps_df = df.copy()
    prev = eps_df["prev_eps"].replace(0, np.nan) # 0을 null로 변환 / series
    eps_df["eps_growth"] = ((eps_df["eps"] - prev) / prev.abs()).round(4) # index를 기준으로 계산
    eps_df["value_trap"] = eps_df["eps_growth"].lt(0).fillna(False) 

    logger.info(
        "밸류트랩 판정: 대상=%d 경고=%d 판정불가(prev_eps 결측)=%d",
        len(eps_df),
        int(eps_df["value_trap"].sum()),
        int(eps_df["eps_growth"].isna().sum()),
    )

    return eps_df

# 저평가 종목 분석
def analyze_fundamental(raw: pd.DataFrame, cfg:ValueConfig) -> pd.DataFrame:
    # 컬럼명 지정
    OUTPUT_COLUMNS = [
        "base_date", "code", "sector",
        "per", "pbr", "eps", "bps", "div_yield", "market_cap", "trading_value",
        "per_pct", "pbr_pct", "value_score", "scored_scope",
        "eps_growth", "value_trap",
    ]

    # 파이프라인 실행
    result = (
        raw.pipe(filter_fundamental, cfg)
        .pipe(score_value, cfg)
        .pipe(flag_value_trap)
    )

    logger.info(
        "밸류 분석 완료: rows=%d score_max=%.2f score_min=%.2f",
        len(result),
        float(result["value_score"].max()),
        float(result["value_score"].min()),
    )
    return result

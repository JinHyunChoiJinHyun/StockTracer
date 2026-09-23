import logging
import pandas as pd

logger = logging.getLogger(__name__) 

# 값 검증 실패 시
def validate_df(df, name:str) -> bool:
    if df is None or df.empty:
            logger.error("%s 실패, 파이프라인 중단", name)
            raise ValueError(f"{name} 데이터가 비어 있습니다.")

# 순매수 검증
def filter_within_trading_value(df: pd.DataFrame) -> pd.DataFrame:
    """순매수 절대값이 거래대금을 초과하는 경우 필터"""
    # label 설정
    NET_COLUMNS = {
        "foreign_net": "외국인",
        "institution_net": "기관",
        "individual_net": "개인",
    }

    # 거래대금 검증
    trading_value = df["trading_value"]
    valid_trading_value = trading_value.notna() & (trading_value > 0) # 유효한 거래대금

    # 순매수 검증  
    invalid_net = pd.Series(False, index=df.index) # False로 값을 채운 Series 생성

    for col, label in NET_COLUMNS.items():
        over_net = valid_trading_value & (df[col].abs() > trading_value)
        if over_net.any():
                for code, net, value in zip(
                    df.loc[over_net, "code"], df.loc[over_net, col], trading_value[over_net] # 불리언 인덱싱
                ):
                    logger.warning(
                            "[%s] %s 순매수(%d)가 거래대금(%d)을 초과합니다. ",
                            code, label, net, value
                    )
        invalid_net |= over_net # 둘 중 하나라도 True일 시 True로 누적

        if invalid_net.any():
                logger.warning("거래대금 초과로 %d개 종목 제외", invalid_net.sum())

    return df[~invalid_net].copy()
 
    
import pandas as pd
import numpy as np

def map_payload(df, field_map:dict) -> list[dict]:
    """필드명 백엔드에 맞게 변환"""
    return[
        {
            # ex) "stock_code" : df["Code"]
            payload_key: row[col] for col, payload_key in field_map.items()
        }
        for row in df.to_dict(orient="records")
    ]

def to_stock_payload(df) -> list[dict]:
    field_map = {
        "Code": "stock_code",
        "Name": "stock_name",
        "Market": "market"
    }

    return map_payload(df, field_map)

def to_price_payload(df) -> list[dict]:
    field_map = {
        "티커": "stock_code",
        "날짜": "base_date",
        "시가": "open_price",
        "고가": "high_price",
        "저가": "low_price",
        "종가": "close_price",
        "등락률": "change_rate",
        "거래량": "volume",
        "거래대금": "trading_value",
        "시가총액": "market_cap"
    }

    return map_payload(df, field_map)

def to_daily_flow_payload(df:pd.DataFrame) -> list[dict]:
    # 필요한 컬럼만 변환
    df = df[[
        "stock_code",
        "base_date",
        "foreign_net",
        "institution_net",
        "individual_net"
    ]]

    return df.replace({np.nan: None}).to_dict(orient="records")

def to_analysis_flow_payload(df:pd.DataFrame) -> list[dict]:
    # 필요한 컬럼만 변환
    df = df[[
        "stock_code", 
        "base_date", 
        "net_ratio", 
        "flow_score",
        "is_double_buy", 
        "is_clean_buy", 
        "reason"
    ]]

    return df.replace({np.nan: None}).to_dict(orient="records")

def to_value_fundamental_payload(df:pd.DataFrame) -> list[dict]:
    # 필요한 컬럼만 변환
    df = df[[
        "base_date", 
        "stock_code", 
        "per", 
        "pbr",
        "eps", 
        "bps", 
        "div_yield",
        "shares_outstanding",
        "per_pct",
        "pbr_pct",
        "value_score",
        "scored_scope",
        "eps_growth",
        "value_trap"
    ]]

    return df.replace({np.nan: None}).to_dict(orient="records")

def to_payload(df:pd.DataFrame) -> list[dict]:
    return df.replace({np.nan: None}).to_dict(orient="records")

def to_payload(df, field_map:dict) -> list[dict]:
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

    return to_payload(df, field_map)

def to_price_payload(df) -> list[dict]:
    field_map = {
        "티커": "stock_code",
        "날짜": "stock_date",
        "시가": "open_price",
        "고가": "high_price",
        "저가": "low_price",
        "종가": "close_price",
        "등락률": "price_change",
        "거래량": "volume",
        "거래대금": "trading_value",
        "시가총액": "market_cap"
    }

    return to_payload(df, field_map)
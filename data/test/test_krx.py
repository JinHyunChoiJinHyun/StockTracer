# python -m test.test_krx로 실행
import os, sys
import time
import logging
import pandas as pd
from common.fetcher import fetch_market_sector, fetch_prices

import dotenv
dotenv.load_dotenv()  # pykrx import 전에 로드

from pykrx import stock

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)
print(sys.path)

date = "20260921"

def fetch_stocks(date: str) -> pd.DataFrame:
    # sector 조회
    sector_df = fetch_market_sector(date)

    # 종목 조회
    frames = []

    for market in ["KOSPI", "KOSDAQ"]:
        df = stock.get_market_price_change(date, date, market=market)
        df = df[["종목명"]].reset_index() # 종목명만 남기고 index를 일반 컬럼으로 변환
        df.columns = ["stock_code", "stock_name"]
        df["market"] = market
        frames.append(df)

    stock_df = pd.concat(frames, ignore_index=True)

    # index가 서로 다르므로 merge 사용 (index가 같으면 join)
    stock_df = stock_df.merge(
        sector_df,
        left_on="stock_code",
        right_index=True,
        how="left"
    )

    # KONEX 추가
    konex = stock.get_market_ticker_list(date, market="KONEX")

    konex_df = pd.DataFrame({
        "stock_code": konex,
        "stock_name": [stock.get_market_ticker_name(ticker) for ticker in konex],
        "market": "KONEX",
        "sector": None
    })

    df = pd.concat(
        [stock_df, konex_df],
        ignore_index=True
    )

    return df


def main():
    df = fetch_prices(date)
    print(df)

if __name__ == "__main__":
    main()
from pykrx import stock
from dotenv import  load_dotenv
import FinanceDataReader as fdr
import pandas as pd
from fetcher import fetch_market_sector, fetch_marketcap, fetch_fundamental, is_business_days

load_dotenv()

date = "20260810"

# fundamental_df = fetch_fundamental(date)
# marketcap_df = fetch_marketcap(date)
# sector_df = fetch_market_sector(date)

# # 조회 결과 체크
# if fundamental_df.empty or marketcap_df.empty:
#     raise ValueError(f"fundamental 조회 결과 없음: {date}")

# # 필드명 변환
# fundamental_df.columns = fundamental_df.columns.str.lower()
# marketcap_df = marketcap_df.rename(columns={
#     "시가총액": "market_cap",
#     "거래대금": "trading_value",
#     "상장주식수": "shares_outstanding"
# })


# # 세 df 결합
# df = fundamental_df.join(marketcap_df[["market_cap","trading_value","shares_outstanding"]], how="inner")

# df = df.join(sector_df, how="left")

days = is_business_days(date)
if not days:
  print("영업일 x")
print(days)



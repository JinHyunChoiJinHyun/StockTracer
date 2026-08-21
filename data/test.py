from pykrx import stock
from dotenv import  load_dotenv
import FinanceDataReader as fdr

load_dotenv()

df_price = stock.get_market_net_purchases_of_equities("20260810", "20260810", "ALL", "기관합계") 

marketcap_df = stock.get_market_cap("20260810", market="ALL")
fundamental_df = stock.get_market_fundamental("20260810", market="ALL")
fundamental_df.columns = fundamental_df.columns.str.lower()

fundamental_df.columns = fundamental_df.columns.str.lower()

marketcap_df = marketcap_df.rename(columns={
    "시가총액": "market_cap",
    "거래대금": "trading_value",
    "상장주식수": "shares_outstanding"
})

# 두 df 결합
df = fundamental_df.join(marketcap_df[["market_cap","trading_value","shares_outstanding"]], how="inner")

print(df.head())


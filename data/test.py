from pykrx import stock
from dotenv import  load_dotenv
import FinanceDataReader as fdr

load_dotenv()

df_price = stock.get_market_net_purchases_of_equities("20260810", "20260810", "ALL", "기관합계") 
df= stock.get_market_ohlcv("20260810") 
print(df.head())

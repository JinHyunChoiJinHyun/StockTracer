from pykrx import stock
from dotenv import  load_dotenv
import FinanceDataReader as fdr

load_dotenv()

df_price = stock.get_market_ohlcv_by_ticker("20260810") 
print(df_price.head())

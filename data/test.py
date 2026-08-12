from pykrx import stock
from dotenv import  load_dotenv
import FinanceDataReader as fdr

load_dotenv()

df_price = stock.get_market_net_purchases_of_equities("20260810", "20260810", "ALL", "외국인") 
print(df_price.head())

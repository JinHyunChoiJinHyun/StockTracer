# 저평가된 주식
import os
from dotenv import  load_dotenv
from pykrx import stock

load_dotenv()

# 1. 20260810 대신 확실히 데이터가 있는 '최근 과거 평일' 날짜를 입력하세요.
# 예시: 2024년 5월 20일 (월요일)
target_date = "20240520" 

# 2. 코스피 데이터 조회 (market 파라미터를 명시해 주는 것이 좋습니다)
df_stock = stock.get_market_fundamental(target_date, market="KOSPI")

print(df_stock.head())

# 외국인/기관 순매수 top 5
import time
import datetime
import os
from dotenv import load_dotenv
import pandas as pd
import FinanceDataReader as fdr
from sqlalchemy import create_engine, text

# 1. DB 연결 설정
load_dotenv()

DB_USER=os.getenv("DB_USER")
DB_PW=os.getenv("DB_PW") 
DB_HOST=os.getenv("DB_HOST") 
DB_PORT=os.getenv("DB_PORT") 
DB_NAME=os.getenv("DB_NAME")

# SQLAlchemy Engine 생성 (PyMySQL 드라이버 사용)
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PW}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
engine = create_engine(DATABASE_URL, echo=False) # ??

# 2-1. 상위 종목 추출 함수
def get_top_market_cap_stocks(limit=50):
    print(f"KRX 시가총액 상위 {limit}개 종목 목록 추출 중...")

    # 1) KRX 전체 상장 종목 정보 불러오기
    df_krx = fdr.StockListing("KRX")

    # 2) 상위 종목 선택
    top_stock = df_krx.head(limit)[["Code","Name","Market"]]

    # dict로 반환 > data frame으로 변환하기 위해
    return top_stock.to_dict(orient="records")

# 2-2 상위 종목 저장 함수
def save_stock_info(target_stocks):
    # 1) 상위 종목 반환 및 저장
    try:
        print("저장 중...")
        df_info = pd.DataFrame(target_stocks)
        df_info.rename(columns={
            "Code": "stock_code",
            "Name": "stock_name",
            'Market': 'market'
        }, inplace=True)
    
        # 종목 저장
        df_info.to_sql(name="stock_info", con=engine, if_exists="append", index=False)
        print(f"{len(target_stocks)}개 저장 완료")
    except Exception as e:
        print(f"[stock_info] 저장 실패: {type(e).__name__} - {e}")
        raise

# 2-3. 상위 종목 일봉 데이터 수집 후 db 저장 함수
def collect_top_stocks_daily(target_stocks, start_date="2026-01-01"):
    
    # 1) 순회하며 주가 수집 및 저장
    for idx, stock in enumerate(target_stocks,1):
        code = stock["Code"]
        name = stock["Name"]

        try:
            print(f"[{idx}/{len(target_stocks)}]{name}({code}) 수집 중...")

            # 주가 데이터 수집
            df_daily = fdr.DataReader(code,start_date)

            if df_daily.empty:
                continue

            # 전처리
            df_daily = df_daily.reset_index() # 왜?
            df_daily.rename(columns={
                "Date": "stock_date",
                "Open": "open_price",
                "High": "high_price",
                "Low": "low_price",
                "Close": "close_price",
                "Volume": "volume",
                "Change": "price_change"
            }, inplace=True)

            # 외래키로 추가
            df_daily["stock_code"] = code

            # 컬럼 순서 정리
            cols=["stock_code","stock_date","open_price","high_price","low_price","close_price","volume","price_change"]
            df_daily = df_daily[cols]

            # DB 저장
            df_daily.to_sql(name="stock_daily", con=engine, if_exists="append", index=False)

            # IP 차단 방지를 위해 0.3초 대기
            time.sleep(0.3)
        except Exception as e:
            print(f"[{name}({code})] 수집 실패: {type(e).__name__} - {e}")
            continue
    print("모든 상위 종목 데이터 수집 및 DB 저장 완료")

# 3. main 실행
if __name__ == "__main__":
    target_stocks = get_top_market_cap_stocks()
    save_stock_info(target_stocks)
    collect_top_stocks_daily(target_stocks,start_date="2026-01-01")


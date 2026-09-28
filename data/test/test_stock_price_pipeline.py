from common.fetcher import fetch_prices
from common.mapper import to_price_payload
from common.api_client import post
from common.util import validate_df, _run_task
import logging

logger = logging.getLogger(__name__) 

date = "20260908"
STOCK_PRICE_ENDPOINT = "/prices/bulk"

def run_price_pipeline(date:str) -> bool:
    def task():
        df = fetch_prices(date)
        validate_df(df,"주가 목록 조회")        
        
        payload = {"items":to_price_payload(df)}

        post(STOCK_PRICE_ENDPOINT, payload)
    
    return _run_task("주가", task)

if __name__ == "__main__":
    run_price_pipeline(date)
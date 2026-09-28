from common.fetcher import fetch_prices
from common.mapper import to_price_payload
from common.api_client import post
from common.util import _run_task
from common.validator import validate_df
import logging

logger = logging.getLogger(__name__) 

STOCK_PRICE_ENDPOINT = "/prices/bulk"

def run_price_pipeline(date:str) -> bool:
    def task():
        df = fetch_prices(date)
        validate_df(df,"주가 목록 조회")        
        
        payload = {"items":to_price_payload(df)}

        post(STOCK_PRICE_ENDPOINT, payload)
    
    return _run_task("주가", task)

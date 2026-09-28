from common.fetcher import fetch_stocks
from common.mapper import to_payload
from common.api_client import post
from common.util import _run_task
from common.validator import validate_df
import logging

logger = logging.getLogger(__name__) 

STOCK_INFO_ENDPOINT = "/info"

def run_stock_pipeline(date:str) -> bool:
    def task():
        df = fetch_stocks(date)
        validate_df(df,"종목 목록 조회")

        payload = to_payload(df)

        post(STOCK_INFO_ENDPOINT, payload)

    return _run_task("종목", task)

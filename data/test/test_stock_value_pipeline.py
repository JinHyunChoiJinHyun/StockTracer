from common.fetcher import build_value_fundamental
from common.analyzer import analyze_fundamental
from common.mapper import to_value_fundamental_payload 
from common.api_client import post
from common.util import validate_df, _run_task
import logging

logger = logging.getLogger(__name__)

date = "20260908"
STOCK_VALUE_ENDPOINT = "/value/save"

def run_value_pipeline(date: str) -> bool:
    def task():
        value_df = build_value_fundamental(date)
        validate_df(value_df, "종목 시장 기본 요소 조회")

        fundamental_df = analyze_fundamental(value_df)
        
        fundamental_payload = {"items": to_value_fundamental_payload(fundamental_df)}

        post(STOCK_VALUE_ENDPOINT,fundamental_payload)

    return _run_task("가치", task)

if __name__ == "__main__":
    run_value_pipeline(date)
from common.fetcher import fetch_prices
from common.mapper import to_price_payload
from common.api_client import post_to_backend
from common.util import validate_df
import logging

logger = logging.getLogger(__name__) 

STOCK_PRICE_ENDPOINT = "/prices/bulk"

def run_price_pipeline(date:str) -> bool:
    logger.info("=== 주가 파이프라인 시작 ===")
    try:
        df = fetch_prices(date)
        validate_df(df,"주가 목록 조회")        
        
        payload = {"items":to_price_payload(df)}

        success = post_to_backend(STOCK_PRICE_ENDPOINT, payload)
        logger.info("=== 주가 파이프라인 종료 (성공: %s) ===", success)
    
        return success
    except Exception as e:
        logger.exception("파이프라인 실행 중 예기치 않은 오류 발생: %s", e)
        return False

from common.fetcher import fetch_stocks
from common.mapper import to_stock_payload
from common.api_client import post_to_backend
from common.util import validate_df
import logging

logger = logging.getLogger(__name__) 

STOCK_INFO_ENDPOINT = "/info"

def run_stock_pipeline() -> bool:
    logger.info("=== 종목 파이프라인 시작 ===")
    try:

        df = fetch_stocks()
        validate_df(df,"종목 목록 조회")

        payload = to_stock_payload(df)

        success = post_to_backend(STOCK_INFO_ENDPOINT, payload)
        logger.info("=== 종목 파이프라인 종료 (성공: %s) ===", success)

        return success
    except Exception as e:
        logger.exception("파이프라인 실행 중 예기치 않은 오류 발생: %s", e)
        return False

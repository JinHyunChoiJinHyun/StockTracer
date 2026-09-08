from fetcher import fetch_prices, fetch_stocks, fetch_investor_flow, build_value_fundamental, is_business_days
from analyzer import build_investor_flow, analyze_investor_flow
from mapper import to_stock_payload, to_price_payload, to_payload
from api_client import post_to_backend
from main import validate_df

STOCK_INFO_ENDPOINT = "/info"

import logging, time, sys, dotenv

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) 

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

run_stock_pipeline()
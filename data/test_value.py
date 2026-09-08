from fetcher import fetch_prices, fetch_stocks, fetch_investor_flow, build_value_fundamental, is_business_days
from analyzer import build_investor_flow, analyze_investor_flow, analyze_fundamental
from mapper import to_stock_payload, to_price_payload, to_payload
from api_client import post_to_backend
from main import validate_df

STOCK_VALUE_ENDPOINT = "/value/save"

import logging, time, sys, dotenv

date = "20260903"

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) 

def run_value_pipeline(date: str) -> bool:
    logger.info("=== 저평가 종목 파이프라인 시작 ===")
    try:
        value_df = build_value_fundamental(date)
        validate_df(value_df, "종목 시장 기본 요소 조회")

        fundamental_df = analyze_fundamental(value_df)

        fundamental_payload = {"items": to_payload(fundamental_df)}

        success_value = post_to_backend(STOCK_VALUE_ENDPOINT,fundamental_payload)

        logger.info("=== 저평가 종목 파이프라인 종료 (성공: %s) ===", success_value)

        return success_value
    except Exception as e:
        logger.exception("파이프라인 실행 중 예기치 않은 오류 발생: %s", e)
        return False

print(run_value_pipeline(date))
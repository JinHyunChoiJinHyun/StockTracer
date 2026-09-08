from fetcher import fetch_prices, fetch_stocks, fetch_investor_flow, build_value_fundamental, is_business_days
from analyzer import build_investor_flow, analyze_investor_flow
from mapper import to_stock_payload, to_price_payload, to_payload
from api_client import post_to_backend
from main import validate_df
from pykrx import stock

STOCK_PRICE_ENDPOINT = "/prices/bulk"

import logging, time, sys, dotenv

date = "20260901"

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) 

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

print(run_price_pipeline(date))
import logging, datetime

from fetcher import fetch_prices, fetch_stocks
from analyzer import analyze_stocks, analyze_prices
from mapper import to_stock_payload, to_price_payload
from api_client import post_to_backend

# .\venv\Scripts\Activate.ps1
# >> 가상환경 실행 코드 (venv 폴더 내 스크립트 실행)

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) 

STOCK_INFO_ENDPOINT = "/info"
STOCK_PRICE_ENDPOINT = "/prices/bulk"

def run_stock_pipeline() -> bool:
    logger.info("=== 종목 파이프라인 시작 ===")

    df = fetch_stocks()
    if df is None or df.empty:
        logger.error("종목 목록 조회 실패, 파이프라인 중단")
        return False

    analyzed_df = analyze_stocks(df)
    payload = to_stock_payload(analyzed_df)

    success = post_to_backend(STOCK_INFO_ENDPOINT, payload)
    logger.info("=== 종목 파이프라인 종료 (성공: %s) ===", success)

    return success

def run_price_pipeline() -> bool:
    logger.info("=== 주가 파이프라인 시작 ===")

    date = datetime.now().strftime("%Y%m%d")
    df = fetch_prices(date)

    if df is None or df.empty:
        logger.error("주가 목록 조회 실패, 파이프라인 중단")
        return False

    analyzed_df = analyze_prices(df, date)
    
    payload = to_price_payload(analyzed_df)

    success = post_to_backend(STOCK_PRICE_ENDPOINT, {"prices": payload})
    logger.info("=== 주가 파이프라인 종료 (성공: %s) ===", success)

    return success

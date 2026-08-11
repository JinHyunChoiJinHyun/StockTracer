import logging, time, sys
from datetime import datetime

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

    # date = datetime.now().strftime("%Y%m%d")
    date = "20260810"
    df = fetch_prices(date)

    if df is None or df.empty:
        logger.error("주가 목록 조회 실패, 파이프라인 중단")
        return False

    analyzed_df = analyze_prices(df, date)
    
    payload = to_price_payload(analyzed_df)

    success = post_to_backend(STOCK_PRICE_ENDPOINT, {"prices": payload})
    logger.info("=== 주가 파이프라인 종료 (성공: %s) ===", success)

    return success

def run_daily_batch():
    start = time.time()
    logger.info("=== 일일 배치 작업 시작 ===")
    overall_success = True # 배치 성공 실패 여부 판단

    try:
        stock_success = run_stock_pipeline()
    except Exception as e:
        logger.exception(f"종목 파이프라인 실행 중 예외 발생: {e}")
        stock_success = False

    if stock_success:
        try:
            price_success = run_price_pipeline()
        except Exception as e:
            logger.exception(f"주가 파이프라인 실행 중 예외 발생: {e}")
            price_success = False
            overall_success = False
        if not price_success:
            logger.error("주가 파이프라인 실패")
            overall_success = False
    else:
        logger.error("배치 작업 중단: 종목 파이프라인 실패")
        overall_success = False

    spend_time = time.time() - start
    logger.info(f"=== 일일 배치 작업 종료 (소요 시간: {spend_time:.1f}초) ===")
    return overall_success

if __name__ == "__main__":
    success = run_daily_batch()
    sys.exit(0 if success else 1) # 왜 필요하지?
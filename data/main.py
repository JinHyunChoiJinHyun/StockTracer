import logging, time, sys
import numpy as np
from datetime import datetime

from fetcher import fetch_prices, fetch_stocks, fetch_investor_flow
from analyzer import build_investor_flow, analyze_investor_flow
from mapper import to_stock_payload, to_price_payload
from api_client import post_to_backend
from typing import Callable
from functools import partial

# .\venv\Scripts\Activate.ps1
# >> 가상환경 실행 코드 (venv 폴더 내 스크립트 실행)

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) 

STOCK_INFO_ENDPOINT = "/info"
STOCK_PRICE_ENDPOINT = "/prices/bulk"
STOCK_INVESTOR_FLOW_DAILY_ENDPOINT = "/investor-flow/daily"
STOCK_INVESTOR_FLOW_RANK_ENDPOINT = "/investor-flow/rank"

# 유틸
def _run_pipeline(name:str, fn: Callable[[], bool]) -> bool:
    try:
        if fn():
            return True
    except Exception:
        logger.exception("%s 파이프라인 실행 중 예외 발생", name)

    return False

# 값 검증 실패 시
def validate_df(df, name:str) -> bool:
    if df is None or df.empty:
            logger.error("%s 실패, 파이프라인 중단", name)
            raise ValueError(f"{name} 데이터가 비어 있습니다.")

# 파이프라인
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

def run_investor_flow(date:str) -> bool:
    logger.info("=== 투자자별 순매수 거래 파이프라인 시작 ===")
    try:
        df = fetch_investor_flow(date)
        validate_df(df,"투자자별 순매수 거래 목록 조회")

        price_df = fetch_prices(date)
        validate_df(price_df,"주가 목록 목록 조회")

        flow_df = build_investor_flow(df,price_df)
        validate_df(flow_df,"투자자별 순매수 거래 조회")
        flow_payload = {"items": flow_df.replace({np.nan: None})}

        analysis_df = analyze_investor_flow(flow_df)
        validate_df(analysis_df,"투자자별 순매수 거래 분석")    
        analysis_payload = {"items": analysis_df}

        success_daily = post_to_backend(STOCK_INVESTOR_FLOW_DAILY_ENDPOINT,flow_payload) # nan은 json이 인식하지 못하므로 none으로 치환
        success_rank = post_to_backend(STOCK_INVESTOR_FLOW_RANK_ENDPOINT,analysis_payload)

        is_success = success_daily and success_rank
        logger.info("=== 투자자별 순매수 거래 파이프라인 종료 (성공: %s) ===", is_success)

        return is_success
    except Exception as e:
        logger.exception("파이프라인 실행 중 예기치 않은 오류 발생: %s", e)
        return False

# 통합 파이프라인
def run_daily_batch() -> bool:
    start = time.time()
    logger.info("=== 일일 배치 작업 시작 ===")
    overall_success = False
    try:
        date = datetime.now().strftime("%Y%m%d")

        # 종목은 FK 대상이므로 실패 시 이후 파이프라인 중단
        if not _run_pipeline("종목", run_stock_pipeline):
            logger.error("배치 중단: 종목 파이프라인 실패")
            return False

        # 상호 독립이므로 하나 실패해도 나머지 진행
        results = {
            name: _run_pipeline(name, fn)
            for name, fn in [
                ("주가", partial(run_price_pipeline, date)),
                ("투자자별 순매수", partial(run_investor_flow, date))
            ]
        }

        failed = [name for name, ok in results.items() if not ok]
        if failed:
            logger.error("실패한 파이프라인: %s", ", ".join(failed)) # ,로 엮어서 배열 출력

        overall_success = not failed
        return overall_success
    
    finally:
        elapsed = time.time() - start
        logger.info(f"=== 일일 배치 작업 종료 (소요 시간: {elapsed:.1f}초) ===")
        return all(results.values())

if __name__ == "__main__":
    success = run_daily_batch()
    sys.exit(0 if success else 1) # 왜 필요하지? 몰라?
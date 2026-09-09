from common.fetcher import fetch_prices, fetch_investor_flow
from common.analyzer import build_investor_flow, analyze_investor_flow
from common.mapper import to_payload
from common.api_client import post_to_backend
from common.util import validate_df
import logging

logger = logging.getLogger(__name__) 

STOCK_INVESTOR_FLOW_DAILY_ENDPOINT = "/investor-flows/daily"
STOCK_INVESTOR_FLOW_RANK_ENDPOINT = "/investor-flows/analysis"

def run_investor_flow(date:str) -> bool:
    logger.info("=== 투자자별 순매수 거래 파이프라인 시작 ===")
    try:
        df = fetch_investor_flow(date)
        validate_df(df,"투자자별 순매수 거래 목록 조회")

        price_df = fetch_prices(date)
        validate_df(price_df,"주가 목록 목록 조회")

        daily_df = build_investor_flow(df,price_df)
        validate_df(daily_df,"투자자별 순매수 거래 조회")
        daily_payload = {"items": to_payload(daily_df)}

        success_daily = post_to_backend(STOCK_INVESTOR_FLOW_DAILY_ENDPOINT,daily_payload) # nan은 json이 인식하지 못하므로 none으로 치환

        analysis_df = analyze_investor_flow(daily_df)
        validate_df(analysis_df,"투자자별 순매수 거래 분석")    
        analysis_payload = {"items": to_payload(analysis_df)}
        
        success_analysis = post_to_backend(STOCK_INVESTOR_FLOW_RANK_ENDPOINT,analysis_payload)

        is_success = success_daily and success_analysis
        logger.info("=== 투자자별 순매수 거래 파이프라인 종료 (성공: %s) ===", is_success)

        return is_success
    except Exception as e:
        logger.exception("파이프라인 실행 중 예기치 않은 오류 발생: %s", e)
        return False
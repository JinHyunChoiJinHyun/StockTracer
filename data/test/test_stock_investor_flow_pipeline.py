from common.fetcher import fetch_prices, fetch_investor_flow
from common.analyzer import build_investor_flow, analyze_investor_flow
from common.mapper import to_daily_flow_payload, to_analysis_flow_payload
from common.api_client import post_to_backend
from common.validator import validate_df, filter_within_trading_value
import logging

logger = logging.getLogger(__name__) 

date = "20260904"

STOCK_INVESTOR_FLOW_ENDPOINT = "/investor-flows/save"
STOCK_INVESTOR_FLOW_DAILY_ENDPOINT = "/investor-flows/daily"
STOCK_INVESTOR_FLOW_RANK_ENDPOINT = "/investor-flows/analysis"

def run_investor_flow_pipeline(date:str) -> bool:
    logger.info("=== 투자자별 순매수 거래 파이프라인 시작 ===")
    try:
        df = fetch_investor_flow(date)
        validate_df(df,"투자자별 순매수 거래 목록 조회")

        price_df = fetch_prices(date)
        validate_df(price_df,"주가 목록 목록 조회")

        daily_df = build_investor_flow(df,price_df)
        validate_df(daily_df,"투자자별 순매수 거래 조회")

        # 순매수 검증
        daily_df = filter_within_trading_value(daily_df)

        # daily_payload = {"items": to_daily_flow_payload(daily_df)}

        # success_daily = post_to_backend(STOCK_INVESTOR_FLOW_DAILY_ENDPOINT,daily_payload) # nan은 json이 인식하지 못하므로 none으로 치환

        # if not success_daily:
        #     return False

        analysis_df = analyze_investor_flow(daily_df)
        validate_df(analysis_df,"투자자별 순매수 거래 분석")    
        # analysis_payload = {"items": to_analysis_flow_payload(analysis_df)}
        flow_payload = {
            "daily" : to_daily_flow_payload(daily_df),
            "analysis" : to_analysis_flow_payload(analysis_df)
        }
        
        is_success = post_to_backend(STOCK_INVESTOR_FLOW_ENDPOINT,flow_payload)

        # is_success = success_daily and success_analysis
        logger.info("=== 투자자별 순매수 거래 파이프라인 종료 (성공: %s) ===", is_success)

        return is_success
    except Exception as e:
        logger.exception("파이프라인 실행 중 예기치 않은 오류 발생: %s", e)
        return False
    
if __name__ == "__main__":
    run_investor_flow_pipeline(date)
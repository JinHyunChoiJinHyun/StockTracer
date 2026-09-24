from common.fetcher import fetch_prices, fetch_investor_flow
from common.analyzer import build_investor_flow, analyze_investor_flow
from common.mapper import to_daily_flow_payload, to_analysis_flow_payload
from common.api_client import post
from common.validator import validate_df, filter_within_trading_value
from common.util import _run_task
import logging

logger = logging.getLogger(__name__) 

date = "20260908"

STOCK_INVESTOR_FLOW_ENDPOINT = "/investor-flow/save"

def run_investor_flow_pipeline(date:str) -> bool:
    def task():
        df = fetch_investor_flow(date)
        validate_df(df,"투자자별 순매수 거래 목록 조회")

        price_df = fetch_prices(date)
        validate_df(price_df,"주가 목록 목록 조회")

        daily_df = build_investor_flow(df,price_df)
        validate_df(daily_df,"투자자별 순매수 거래 조회")

        # 순매수 검증
        daily_df = filter_within_trading_value(daily_df)

        analysis_df = analyze_investor_flow(daily_df)
        validate_df(analysis_df,"투자자별 순매수 거래 분석")    

        flow_payload = {
            "daily" : to_daily_flow_payload(daily_df),
            "analysis" : to_analysis_flow_payload(analysis_df)
        }
        
        post(STOCK_INVESTOR_FLOW_ENDPOINT,flow_payload)

    return _run_task("투자자별 순매수 거래", task)
    
if __name__ == "__main__":
    run_investor_flow_pipeline(date)
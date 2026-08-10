from fetcher import get_stock_prices, get_top_stocks
from api_client import post_to_backend

STOCK_INFO_ENDPOINT = "/info"
STOCK_PRICE_ENDPOINT = "/prices/bulk"

def run_pipeline():
    # 1. 주식 정보 저장
    stock_payload = get_top_stocks()
    post_to_backend(STOCK_INFO_ENDPOINT,stock_payload)

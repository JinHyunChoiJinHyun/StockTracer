from common.fetcher import build_value_fundamental
from common.analyzer import analyze_fundamental
from common.mapper import to_payload
from common.api_client import post_to_backend
from common.util import validate_df
import logging

logger = logging.getLogger(__name__)

date = "20260903"
STOCK_VALUE_ENDPOINT = "/value/save"

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

if __name__ == "__main__":
    run_value_pipeline(date)
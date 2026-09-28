import logging
from common.api_client import put
from common.util import _run_task
from datetime import date,datetime

logger = logging.getLogger(__name__)

STOCK_TAG_ENDPOINT = "/tags/"
base_date = "20260910"
# 태그 생성
def generate_tags(date_str:str) -> None:
    def task():
        # 날짜 변환 (예: "20260907" -> "2026-09-07")
        base_date = datetime.strptime(date_str, "%Y%m%d").date()

        result = put(f"{STOCK_TAG_ENDPOINT}{base_date}")

        logger.info(
            "태그 생성 결과. base_date=%s, 종목=%d건, 태그=%d건, 분포=%s",
            base_date,
            result["stockCount"],
            result["tagCount"],
            result["countByTag"],
        )

    _run_task("태그 생성", task)

if __name__ == "__main__":
    generate_tags(base_date)
        


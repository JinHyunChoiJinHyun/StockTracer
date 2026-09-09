from pipeline import stock_info_pipeline, stock_price_pipeline, stock_investor_flow_pipeline, stock_value_pipeline
from common.fetcher import is_business_days

import logging, time, sys

from typing import Callable
from functools import partial

# .\venv\Scripts\Activate.ps1
# >> 가상환경 실행 코드 (venv 폴더 내 스크립트 실행)

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) 

# 파이프라인 통합
def _run_pipeline(name:str, fn: Callable[[], bool]) -> bool:
    try:
        if fn():
            return True
    except Exception:
        logger.exception("%s 파이프라인 실행 중 예외 발생", name)

    return False

def run_daily_batch() -> bool:
    start = time.time()
    logger.info("=== 일일 배치 작업 시작 ===")
    try:
        # 거래일 목록에 오늘 날짜가 포함되면 파이프라인 실행 아니면 중단
        # date = datetime.now().strftime("%Y%m%d")
        date = "20260904"
        if not is_business_days(date):
            logger.info("[%s] 비영업일이므로 종료합니다", date)
            return False
        
        # 종목은 FK 대상이므로 실패 시 이후 파이프라인 중단
        if not _run_pipeline("종목", stock_info_pipeline.run_stock_pipeline):
            logger.error("배치 중단: 종목 파이프라인 실패")
            return False

        # 서로 독립적이므로 하나가 실패해도 나머지를 계속 실행
        results = {
            name: _run_pipeline(name, fn)
            for name, fn in [
                ("주가", partial(stock_price_pipeline.run_price_pipeline, date)),
                ("투자자별 순매수", partial(stock_investor_flow_pipeline.run_investor_flow, date)),
                ("저평가 종목", partial(stock_value_pipeline.run_value_pipeline, date))
            ]
        }

        failed = [name for name, ok in results.items() if not ok]
        if failed:
            logger.error("실패한 파이프라인: %s", ", ".join(failed)) # ,로 엮어서 배열 출력

        return not failed
    except Exception as e:
        logger.exception("일일 배치 실행 중 예외 발생")
        print(e)
        return False
    
    finally:
        elapsed = time.time() - start
        logger.info(f"=== 일일 배치 작업 종료 (소요 시간: {elapsed:.1f}초) ===")

if __name__ == "__main__":
    success = run_daily_batch()
    sys.exit(0 if success else 1)

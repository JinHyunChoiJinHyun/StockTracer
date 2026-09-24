import logging, requests
import pandas as pd
from typing import Callable

logger = logging.getLogger(__name__) 

class ValidationError(Exception):
    """데이터 검증 실패"""

# 값 검증 실패 시
def validate_df(df:pd.DataFrame, name:str) -> None:
    if df is None or df.empty:
            logger.error("%s 실패, 파이프라인 중단", name)
            raise ValueError(f"{name} 데이터가 비어 있습니다.")

# 공통 except 처리
def _run_task(name: str, task: Callable[[], None]) -> bool:
    logger.info("=== %s 파이프라인 시작 ===", name)
    try:
         task()
    except ValidationError as e:
        logger.error("[%s] 데이터 검증 실패: %s", name, e)
        return False

    except requests.HTTPError as e:
        logger.error(
            "[%s] 백엔드 응답 오류 status=%s body=%s",
            name, e.response.status_code, e.response.text,
        )
        return False

    except requests.JSONDecodeError as e:
        logger.error("[%s] 백엔드 응답 파싱 실패: %s", name, e)
        return False

    except requests.RequestException as e:
        logger.error("[%s] 백엔드 연결 실패: %s", name, e)
        return False

    except Exception:
        logger.exception("[%s] 예기치 않은 오류 발생", name)
        return False

    logger.info("=== %s 파이프라인 종료 (성공) ===", name)
    return True
import requests, logging, time
from typing import Any

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) #?

# 백엔드 API 설정
BACKEND_BASE_URL = "http://localhost:8080/api/v1/stocks"  # 실제 백엔드 주소로 교체

# 백엔드로 데이터 전송
def post_to_backend(end_point:str, paylaod:dict, retry_count:int = 3) -> bool:
    url = BACKEND_BASE_URL + end_point
    
    for attempt in range(1, retry_count+1):
        try:
            res = requests.post(url, json=paylaod, timeout=5)
            res.raise_for_status()
            return True
        
        except requests.HTTPError as e:
            # 클라이언트 에러인 경우 즉시 중단
            status = e.response.status_code if e.response is not None else None
            if status is not None and 400 <= status < 500: # 클라이언트 에러
                logging.error("POST 실패 (재시도 불가) error=%s", res.text)
                return False

            # 서버 에러인 경우 재시도
            logger.warning("POST 실패 (%d번째 시도) url=%s error=%s", attempt, url, e)
            if attempt < retry_count:
                time.sleep(2 ** (attempt - 1))

        except requests.RequestException as e:
            # 서버 에러
            logger.warning("POST 실패 (%d번째 시도) url=%s error=%s", attempt, url, e)
            if attempt < retry_count:
                time.sleep(2 ** (attempt - 1))
    logger.error("POST 최종 실패: url=%s", url)
    return False

# 백엔드로 데이터 요청
def get(end_point: str, params: dict, retry_count:int = 3) -> Any:
    url = BACKEND_BASE_URL + end_point
    last_exc: Exception | None = None
    for attempt in range(1, retry_count+1):
        try:
            res = requests.get(url, params=params, timeout=30)
            res.raise_for_status()
            return res.json()
        except requests.HTTPError as e:
            status = e.response.status_code
            if 400 <= status < 500:
                logger.error("GET 클라이언트 오류(재시도 안 함): url=%s status=%d", url, status)
                raise
            last_exc = e
        except requests.RequestException as e:
            logger.warning("GET 실패 (%d번째 시도) url=%s error=%s", attempt, url, e)
            if attempt < retry_count:
                time.sleep(2 ** (attempt - 1))
            last_exc = e
    logger.error("GET 최종 실패: url=%s", url)
    raise last_exc

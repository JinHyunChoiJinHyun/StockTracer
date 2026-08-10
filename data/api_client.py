import requests, logging

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) #?

# 백엔드 API 설정
BACKEND_BASE_URL = "http://localhost:8080/api/v1/stocks"  # 실제 백엔드 주소로 교체

# 메인으로 이동
STOCK_INFO_ENDPOINT = "/info"
STOCK_PRICE_ENDPOINT = "/prices/bulk"

# 통신 설정
retry_count = 3

# 백엔드로 데이터 전송
def post_to_backend(end_point:str, paylaod) -> bool:
    url = BACKEND_BASE_URL + end_point
    for attempt in range(1, retry_count+1):
        try:
            res = requests.post(url, json=paylaod, timeout=5)
            res.raise_for_status()
            return True
        
        except requests.RequestException as e:
            logger.warning("POST 실패 (%d번째 시도) url=%s error=%s", attempt, url, e)
    logger.error("POST 최종 실패: url=%s", url)
    return False
import requests, logging, time
from requests.adapters import HTTPAdapter
from typing import Any
from urllib3.util.retry import Retry

# 로그 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__) #?

# 백엔드 API 설정
BACKEND_BASE_URL = "http://localhost:8080/api/v1/stocks" 

# session 생성
def _build_session() -> requests.Session:
    # session 생성
    session = requests.Session()

    # 재시도 규칙 설정
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=(500,502,503,504),
        allowed_methods=("POST","PUT","GET")
    )

    # http 통신 규칙 추가
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    return session

_session = _build_session() # session 생성 함수 호출

# 백엔드로 데이터 전송
def post(end_point: str, payload:dict) -> None:
    url = BACKEND_BASE_URL + end_point

    res = _session.post(
        url,
        json=payload,
        timeout=5
    )

    res.raise_for_status()

# 백엔드로 데이터 요청
def get(end_point: str, params: dict) -> Any:
    url = BACKEND_BASE_URL + end_point

    res = _session.get(
        url, 
        params=params, 
        timeout=30)
    
    res.raise_for_status()

    return res.json() if res.content else None

def put(endpoint: str, payload:dict | None = None) -> Any:
    url = BACKEND_BASE_URL + endpoint

    res = _session.put(
        url,
        json=payload,
        timeout=5
    )

    res.raise_for_status()

    return res.json() if res.content else None

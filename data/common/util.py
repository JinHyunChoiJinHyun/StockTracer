import logging

logger = logging.getLogger(__name__) 

# 값 검증 실패 시
def validate_df(df, name:str) -> bool:
    if df is None or df.empty:
            logger.error("%s 실패, 파이프라인 중단", name)
            raise ValueError(f"{name} 데이터가 비어 있습니다.")
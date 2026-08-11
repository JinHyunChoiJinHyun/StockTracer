DROP TABLE IF EXISTS stock_price;
DROP TABLE IF EXISTS stock;

-- 1. 종목 정보 테이블
CREATE TABLE stock_info (
                       stock_code  VARCHAR2(20) PRIMARY KEY, -- 종목 코드 (예: 005930)
                       stock_name  VARCHAR2(50) NOT NULL,    -- 종목 이름 (예: 삼성전자)
                       market VARCHAR2(20)              -- 시장 구분 (예: KOSPI, KOSDAQ)
);
-- 2. 주가 정보 테이블
CREATE TABLE stock_price (
                             stock_code   VARCHAR2(20) NOT NULL,
                             stock_date   DATE         NOT NULL,
                             open_price   NUMBER(18),
                             high_price   NUMBER(18),
                             low_price    NUMBER(18),
                             close_price  NUMBER(18),
                             price_change NUMBER(18),
                             volume       NUMBER,
                             trading_value    NUMBER,
                             market_cap       NUMBER,
                             PRIMARY KEY (stock_code, stock_date)
);
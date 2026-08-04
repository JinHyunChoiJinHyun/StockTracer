DROP TABLE IF EXISTS stock_price;
DROP TABLE IF EXISTS stock;

-- 1. 종목 정보 테이블
CREATE TABLE stock (
                       stock_code  VARCHAR(20) PRIMARY KEY, -- 종목 코드 (예: 005930)
                       stock_name  VARCHAR(50) NOT NULL,    -- 종목 이름 (예: 삼성전자)
                       market_type VARCHAR(20)              -- 시장 구분 (예: KOSPI, KOSDAQ)
);

-- 2. 주가 정보 테이블
CREATE TABLE stock_price (
                             id          BIGINT AUTO_INCREMENT PRIMARY KEY,
                             stock_code  VARCHAR(20) NOT NULL, -- stock 테이블의 stock_code 참조
                             price_date  DATE        NOT NULL, -- 일자
                             open_price  BIGINT,               -- 시가
                             close_price BIGINT      NOT NULL, -- 종가
                             high_price  BIGINT,               -- 고가
                             low_price   BIGINT,               -- 저가
                             volume      BIGINT                -- 거래량
);
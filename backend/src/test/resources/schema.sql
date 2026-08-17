-- 겹치는 테이블이 있다면 미리 삭제 (에러 방지)
DROP TABLE IF EXISTS investor_flow_daily;
DROP TABLE IF EXISTS stock_price;
DROP TABLE IF EXISTS stock_info;

-- 1. 종목 정보 테이블
CREATE TABLE stock_info (
    stock_code  VARCHAR(20) PRIMARY KEY, -- 종목 코드 (예: 005930)
    stock_name  VARCHAR(50) NOT NULL,    -- 종목 이름 (예: 삼성전자)
    market      VARCHAR(20)              -- 시장 구분 (예: KOSPI, KOSDAQ)
);

-- 2. 주가 정보 테이블
CREATE TABLE stock_price (
     stock_code    VARCHAR(20)  NOT NULL,
     stock_date    DATE         NOT NULL,
     open_price    BIGINT,                -- NUMBER(18) -> BIGINT로 변경
     high_price    BIGINT,
     low_price     BIGINT,
     close_price   BIGINT,
     price_change  BIGINT,
     volume        BIGINT,                -- NUMBER -> BIGINT로 변경
     trading_value BIGINT,
     market_cap    BIGINT,
     PRIMARY KEY (stock_code, stock_date)
);

-- 3. 일별 투자자 수급 테이블
CREATE TABLE investor_flow_daily (
     stock_code      VARCHAR(20)  NOT NULL, -- 외래키 참조를 위해 stock_info와 길이 통일 (10 -> 20)
     base_date       DATE         NOT NULL,
     foreign_net     BIGINT,
     institution_net BIGINT,
     individual_net  BIGINT,
     trading_value   BIGINT       NULL,
     created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
     updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     PRIMARY KEY (stock_code, base_date)
);
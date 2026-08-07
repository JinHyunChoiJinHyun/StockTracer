-- stock 기본 정보 1건
INSERT INTO stock_info (stock_code, stock_name, market)
VALUES ('005930', '삼성전자', 'KOSPI');

INSERT INTO stock_info (stock_code, stock_name, market)
VALUES ('000660', 'sk하이닉스', 'KOSPI');

-- -- stock_price 일자별 주가 정보 2건
-- INSERT INTO stock_price (stock_code, stock_date, open_price, close_price, high_price, low_price, volume)
-- VALUES ('005930', '2026-08-01', 74500, 75000, 75500, 74000, 10000000);
--
-- INSERT INTO stock_price (stock_code, stock_date, open_price, close_price, high_price, low_price, volume)
-- VALUES ('005930', '2026-08-02', 75000, 76000, 76500, 74800, 12000000);
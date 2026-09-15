/**
 * 백엔드 통신을 담당하는 파일입니다.
 * 화면 컴포넌트는 fetch 를 직접 부르지 않고, 항상 이 파일의 fetchMainStocks() 만 사용합니다.
 */

import type {
  Stock,
  StockApiItem,
  StockDetail,
  StockDetailApiItem,
  StockListApiResponse,
  StockListRequest,
  StockListResult,
} from '../types/Stock';
import { fetchMainStocksFromMock } from '../mock/MockApi';
import { fetchStockDetailFromMock } from '../mock/MockDetail';
import { createMockTags } from '../mock/MockTags';

/**
 * true  -> mock 데이터를 사용합니다. (백엔드가 없어도 화면이 동작)
 * false -> 아래 API_BASE_URL 의 실제 백엔드를 호출합니다.
 */
export const USE_MOCK = true;

const API_BASE_URL = 'http://localhost:8080';

/**
 * 백엔드 JSON(snake_case)을 화면에서 쓰는 Stock(camelCase)으로 바꿉니다.
 * 백엔드 필드 이름이 바뀌면 이 함수만 고치면 됩니다.
 */
function convertApiStockToStock(apiStock: StockApiItem): Stock {
  const stock: Stock = {
    stockCode: apiStock.stock_code,
    stockName: apiStock.stock_name,
    sector: apiStock.sector,
    baseDate: apiStock.base_date,

    closePrice: apiStock.close_price,
    priceChange: apiStock.price_change,

    totalScore: apiStock.total_score,
    supplyScore: apiStock.supply_score,
    valueScore: apiStock.value_score,

    per: apiStock.per,
    pbr: apiStock.pbr,
    divYield: apiStock.div_yield,
    epsGrowthRate: apiStock.eps_growth_rate,

    grade: apiStock.grade,
    isValueTrap: apiStock.is_value_trap,

    tags: [],
  };

  // 👇 태그 API가 아직 없어서 프론트에서 임시로 만들고 있는 부분입니다.
  //    태그 API가 생기면 이 한 줄을  stock.tags = apiStock.tags;  로 바꾸면 됩니다.
  stock.tags = createMockTags(stock);

  return stock;
}

/** 메인 페이지 종목 목록을 가져옵니다. */
export async function fetchMainStocks(request: StockListRequest): Promise<StockListResult> {
  if (USE_MOCK) {
    return fetchMainStocksFromMock(request);
  }

  const query = new URLSearchParams();
  query.set('page', String(request.page));
  query.set('size', String(request.size));
  query.set('sort', request.sort);
  if (request.keyword.trim() !== '') {
    query.set('keyword', request.keyword.trim());
  }
  if (request.filter !== 'ALL') {
    query.set('filter', request.filter);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/main/stocks?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`종목 목록 요청 실패 (status: ${response.status})`);
  }

  const apiResponse: StockListApiResponse = await response.json();

  return {
    stocks: apiResponse.content.map(convertApiStockToStock),
    page: apiResponse.page,
    totalPages: apiResponse.total_pages,
    totalCount: apiResponse.total_elements,
  };
}

/** 상세 응답(snake_case)을 화면에서 쓰는 StockDetail(camelCase)로 바꿉니다. */
function convertApiStockDetailToStockDetail(apiDetail: StockDetailApiItem): StockDetail {
  return {
    ...convertApiStockToStock(apiDetail),

    eps: apiDetail.eps,
    bps: apiDetail.bps,
    marketCap: apiDetail.market_cap,
    sectorPercentile: apiDetail.sector_percentile,
    foreignNetBuyAmount: apiDetail.foreign_net_buy_amount,
    institutionNetBuyAmount: apiDetail.institution_net_buy_amount,
    foreignNetBuyDays: apiDetail.foreign_net_buy_days,
    valueTrapReasons: apiDetail.value_trap_reasons,

    priceHistory: apiDetail.price_history.map((point) => ({
      date: point.date,
      closePrice: point.close_price,
    })),
    investorFlowHistory: apiDetail.investor_flow_history.map((point) => ({
      date: point.date,
      foreignNetBuy: point.foreign_net_buy,
      institutionNetBuy: point.institution_net_buy,
    })),
    sectorAverage: {
      per: apiDetail.sector_average.per,
      pbr: apiDetail.sector_average.pbr,
      divYield: apiDetail.sector_average.div_yield,
    },
  };
}

/** 종목 하나의 상세 정보를 가져옵니다. */
export async function fetchStockDetail(stockCode: string): Promise<StockDetail> {
  if (USE_MOCK) {
    return fetchStockDetailFromMock(stockCode);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/stocks/${stockCode}`);

  if (!response.ok) {
    throw new Error(`종목 상세 요청 실패 (status: ${response.status})`);
  }

  const apiDetail: StockDetailApiItem = await response.json();

  return convertApiStockDetailToStockDetail(apiDetail);
}
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

// 1. API 응답 데이터 및 하위 데이터에 대한 타입(인터페이스) 정의
interface ProofData {
  date: string;
  amount: number;
}

interface ThemeHighlight {
  title: string;
  summary: string;
  proof_data: ProofData[];
}

interface StockData {
  stock_code: string;
  stock_name: string;
  current_price: number;
  change_rate: string;
  theme_highlight: ThemeHighlight | null;
}

export const StockDetailPage: React.FC = () => {
  // 2. React Router 훅에 제네릭으로 타입 지정
  const { id } = useParams<{ id: string }>(); 
  const [searchParams] = useSearchParams();
  const theme = searchParams.get('theme');

  // 3. useState에 위에서 정의한 인터페이스 타입 지정
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMockData = () => {
      // id가 undefined일 수 있는 TS 에러 방지용 안전 처리
      const safeId = id || '000000';
      
      const data: StockData = {
        stock_code: safeId,
        stock_name: safeId === '005930' ? "삼성전자" : "검색된 종목",
        current_price: 78500,
        change_rate: "+2.1%",
        theme_highlight: theme === 'foreigner_buy' ? {
          title: "외국인 5일 연속 폭풍 매수 중! 🛒",
          summary: "최근 5일간 외국인이 총 3,200억 원을 순매수하며 주가 상승을 견인하고 있습니다.",
          proof_data: [
            { date: "08-07", amount: 400 },
            { date: "08-08", amount: 820 },
            { date: "08-09", amount: 510 },
            { date: "08-10", amount: 620 },
            { date: "08-11", amount: 850 }
          ]
        } : null 
      };

      setStockData(data);
      setIsLoading(false);
    };

    setTimeout(fetchMockData, 500);
  }, [id, theme]);

  // stockData가 null일 때의 렌더링 에러 방지 (Type Guard)
  if (isLoading || !stockData) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 font-semibold">데이터를 분석 중입니다...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* 상단 공통 헤더 */}
      <header className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {stockData.stock_name} <span className="text-sm font-medium text-gray-400 ml-1">{stockData.stock_code}</span>
          </h1>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-extrabold text-red-500">
              {stockData.current_price.toLocaleString()}원
            </span>
            <span className="text-lg font-semibold text-red-500 ml-2">
              {stockData.change_rate}
            </span>
          </div>
        </div>
      </header>

      {/* 테마 맞춤형 하이라이트 섹션 */}
      {/* 추후 컴포넌트로 분리해서 관리 */}
      {stockData.theme_highlight && (
        <section className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">
            {stockData.theme_highlight.title}
          </h2>
          <p className="text-sm text-blue-700 mb-6 leading-relaxed">
            {stockData.theme_highlight.summary}
          </p>
          
          <div className="bg-white p-5 rounded-xl shadow-inner">
            <h3 className="text-xs font-bold text-gray-500 mb-4 text-center">일별 외국인 순매수 추이 (단위: 억원)</h3>
            <div className="flex items-end justify-around h-32 mt-2 gap-2">
              {stockData.theme_highlight.proof_data.map((item, index) => (
                <div key={index} className="flex flex-col items-center justify-end w-full">
                  <div 
                    className="w-full max-w-[40px] bg-red-400 rounded-t-md transition-all duration-500 hover:bg-red-500 cursor-pointer" 
                    style={{ height: `${(item.amount / 1000) * 100}%` }}
                    title={`${item.amount}억 원`}
                  ></div>
                  <span className="text-[10px] text-gray-400 mt-2 font-medium">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 공통 차트 영역 */}
      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-4">주가 차트</h2>
        <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
          여기에 캔들 차트 라이브러리가 삽입됩니다.
        </div>
      </section>

    </div>
  );
};


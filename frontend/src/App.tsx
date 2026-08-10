import React, {useState} from "react"
import { StockAnalysis, type StockData } from "./components/StockAnalysis";
import './App.css'

// const sampleAnalysisData: PriceChangeReason = {
//   id: '1',
//   stockName: '삼성전자',
//   stockCode: '005930',
//   currentPrice: 76800,
//   changeRate: 3.42,
//   analysisDate: '2026-07-31',
//   summary: '차세대 HBM4 반도체 공급 계약 체결 소식과 함께 2분기 영업이익이 시장 전망치(컨센서스)를 15% 상회하는 어닝 서프라이즈를 기록하며 기관/외국인의 강한 매수세가 유입되었습니다.',
//   sentiment: 'BULLISH',
//   drivers: [
//     {
//       category: '실적 발표',
//       title: '2분기 어닝 서프라이즈',
//       description: '메모리 반도체 가격 상승으로 반도체(DS) 부문 영업이익이 전분기 대비 40% 이상 급증했습니다.',
//       impactScore: 5,
//     },
//     {
//       category: '수주/공시',
//       title: '글로벌 Big-Tech HBM4 공급 확정',
//       description: '엔비디아/빅테크향 차세대 6세대 HBM 공급 계약 연내 체결 소식이 외신을 통해 보도되었습니다.',
//       impactScore: 4,
//     },
//   ],
//   relatedNews: [
//     {
//       title: '삼성전자, 2분기 "어닝 서프라이즈"... 반도체 부문 효자 노릇',
//       publisher: '한국경제',
//       time: '2시간 전',
//       url: '#',
//     },
//     {
//       title: '[속보] 외국인, 삼성전자 5,000억 순매수... HBM 기대감 감돌아',
//       publisher: '매일경제',
//       time: '4시간 전',
//       url: '#',
//     },
//   ],
// };

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>('005930');
  return (
    <div style={{ backgroundColor: '#11111B', minHeight: '100vh', padding: '40px 20px', textAlign: 'center' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#FFF', fontSize: '28px', marginBottom: '8px' }}>🔍 Stock Tracer</h1>

        {/* 종목 검색바 */}
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="종목명 또는 종목코드를 입력하세요 (예: 삼성전자)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '12px 20px',
              borderRadius: '25px',
              border: '1px solid #45475A',
              backgroundColor: '#1E1E2E',
              color: '#FFF',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </header>

      {/* 분석 결과 카드 */}
      <main>
        <StockAnalysis stockCode={"005930"} />
      </main>
    </div>
  );
}

export default App

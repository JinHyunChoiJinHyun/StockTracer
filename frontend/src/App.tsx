import React, {useState} from "react"
import StockDashboard from "./components/StockDashboard"
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>('005930');
  return (
    <div style={{ backgroundColor: '#11111B', minHeight: '100vh', padding: '40px 20px', textAlign: 'center' }}>
      
      {/* 분석 결과 카드 */}
      <main>
        {/* <StockAnalysis stockCode={"005930"} /> */}
        <StockDashboard />
      </main>
    </div>
  );
}

export default App

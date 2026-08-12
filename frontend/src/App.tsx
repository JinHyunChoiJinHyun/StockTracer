import React, {useState} from "react"
import { Routes, Route } from 'react-router-dom';
import {StockDashboard} from "./components/StockDashboard"
import { StockDetailPage } from "./components/StockDetailPage";
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>('005930');
  return (
    <div style={{ backgroundColor: '#11111B', minHeight: '100vh', padding: '40px 20px', textAlign: 'center' }}>
      
      {/* 분석 결과 카드 */}

      <Routes>
        <Route path="/" element={<StockDashboard />} />
        <Route path="/stock/:id" element={<StockDetailPage />} />
      </Routes>
    </div>
  );
}

export default App

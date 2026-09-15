/**
 * 화면 주소(라우팅)를 정하는 파일입니다.
 *
 *   /                -> 메인 페이지 (종목 목록)
 *   /stocks/005930   -> 상세 페이지
 *
 * react-router-dom 이 필요합니다: npm install react-router-dom
 */

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import StockDetailPage from './pages/StockDetailPage';
// import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/stocks/:stockCode" element={<StockDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
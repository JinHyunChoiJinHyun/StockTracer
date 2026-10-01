import { BrowserRouter, Routes, Route } from "react-router";
import MainPage from "./pages/MainPage";
import StockDetailPage from "./pages/StockDetailPage";

// 페이지 구성
//   /                    → Main Page (종목 목록)
//   /stocks/:stockCode   → Stock Detail Page (예: /stocks/005930)
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/stocks/:stockCode" element={<StockDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React, {useState} from "react"
import { Routes, Route } from 'react-router-dom';
import './App.css'
import HomePage from "./HomePage";
import MainPage from "./MainPage";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>('005930');
  return (
    <div>
      
      {/* 분석 결과 카드 */}

      <Routes>
        <Route path="/" element={<MainPage/>} />
      </Routes>
    </div>
  );
}

export default App

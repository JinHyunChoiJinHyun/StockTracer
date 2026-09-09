import React, {useState} from "react"
import { Routes, Route } from 'react-router-dom';
import './App.css'
import HomePage from "./HomePage";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>('005930');
  return (
    <div>
      
      {/* 분석 결과 카드 */}

      <Routes>
        <Route path="/" element={<HomePage/>} />
      </Routes>
    </div>
  );
}

export default App

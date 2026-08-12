import React, { useState } from 'react';
import { 
  Sun, CloudRain, TrendingUp, HelpCircle, 
  Search, Flame, Users, ShieldCheck, ChevronRight 
} from 'lucide-react';

export default function StockDashboard() {
  // 초보자 맞춤형 용어 툴팁 상태 관리
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-m auto space-y-6">

        {/* 1. 상단 헤더 및 통합 검색창 */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Stock Tracer <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 font-semibold rounded-full">주린이 전용</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">어려운 지표 없이 한눈에 파악하는 오늘의 증시 분위기</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="종목명 또는 테마 검색 (예: 삼성전자, AI)" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </header>


        {/* 2. [최우선] 3초 만에 이해하는 오늘의 증시 날씨 */}
        <section className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            {/* 2-1. 날씨 아이콘 및 직관적 평가 */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold backdrop-blur-sm border border-emerald-500/30">
                <Sun className="w-3.5 h-3.5" /> 오늘 증시 날씨: 맑음 (상승장)
              </div>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                "외국인 수급 유입으로<br />시장 분위기가 훈훈해요! 🔥"
              </h2>
              <p className="text-sm text-slate-300">
                하락하는 종목보다 상승하는 알짜 종목이 훨씬 많은 상태입니다.
              </p>
            </div>

            {/* 2-2. 직관적인 등락 비율 바 (상승/보합/하락) */}
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 w-full md:w-80 space-y-3">
              <div className="flex justify-between text-xs font-medium text-slate-200">
                <span className="text-emerald-400">상승 62% (1,340)</span>
                <span className="text-slate-400">보합 8%</span>
                <span className="text-rose-400">하락 30% (650)</span>
              </div>
              {/* 비율 그래프 시각화 */}
              <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full w-[62%]" />
                <div className="bg-slate-400 h-full w-[8%]" />
                <div className="bg-rose-500 h-full w-[30%]" />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                전체 2,000여 개 종목의 실시간 움직임 비율
              </p>
            </div>
          </div>
        </section>


        {/* 3. 지금 가장 핫한 테마 & 뉴스 키워드 */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> 오늘 돈이 몰리는 핫 테마
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'AI 반도체', count: '+4.2%', desc: '대형주 수급 집중', color: 'bg-orange-50 text-orange-700 border-orange-200' },
              { name: '2차전지', count: '+2.8%', desc: '실적 반등 기대감', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { name: '바이오/제약', count: '+1.5%', desc: '신약 임상 성공', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { name: '로봇 공학', count: '-0.8%', desc: '차익 실현 매물', color: 'bg-slate-100 text-slate-700 border-slate-200' },
            ].map((theme, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${theme.color} cursor-pointer hover:shadow-sm transition-all`}>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm">{theme.name}</span>
                  <span className="text-xs font-extrabold">{theme.count}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">{theme.desc}</p>
              </div>
            ))}
          </div>
        </section>


        {/* 4. 초보자를 위한 목적별 종목 큐레이션 랭킹 */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* 4-1. 외국인/기관 연속 매수 랭킹 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" /> 큰손들이 사 모으는 알짜주
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">외국인/기관이 3일 연속 순매수한 종목</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="space-y-2">
              {[
                { name: '삼성전자', tag: '반도체', price: '78,500원', rate: '+2.1%', reason: '외국인 5일 연속 매수' },
                { name: 'SK하이닉스', tag: '반도체', price: '182,000원', rate: '+3.5%', reason: '기관 대량 유입' },
                { name: '현대차', tag: '자동차', price: '245,000원', rate: '+0.8%', reason: '배당 기대감 상승' },
              ].map((stock, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold w-5 h-5 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{stock.name}</div>
                      <div className="text-[11px] text-slate-400">{stock.tag} • {stock.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{stock.price}</div>
                    <div className="text-xs font-semibold text-emerald-600">{stock.rate}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4-2. 실적 우수 및 튼튼한 저평가주 */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> 돈 잘 버는데 저평가된 기업
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">버는 돈 대비 주가가 저렴한 안전지향 종목</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="space-y-2">
              {[
                { name: 'NAVER', tag: '플랫폼', price: '185,000원', rate: '+1.2%', reason: '영업이익 최고치 달성' },
                { name: '기아', tag: '자동차', price: '118,000원', rate: '+1.5%', reason: '저PBR 대표 안전주' },
                { name: 'KB금융', tag: '금융', price: '75,000원', rate: '-0.4%', reason: '높은 배당 수익률' },
              ].map((stock, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold w-5 h-5 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{stock.name}</div>
                      <div className="text-[11px] text-slate-400">{stock.tag} • {stock.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{stock.price}</div>
                    <div className={`text-xs font-semibold ${stock.rate.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stock.rate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
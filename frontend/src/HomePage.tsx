import { useEffect, useMemo, useState } from 'react';

/* ============================================================================
 * 설정
 * ========================================================================== */

/** 백엔드 주소. 비우면 같은 오리진으로 요청한다(vite proxy 사용 시). */
const API_BASE = '';

/**
 * 백엔드 없이 화면만 확인할 때 true.
 * 실제 API를 붙이면 false 로 바꾸면 된다.
 */
const USE_MOCK = true;

/** 한 번에 받아올 종목 수. 검색·필터가 클라이언트에서 도는 동안의 상한. */
const FETCH_LIMIT = 200;

/* ============================================================================
 * 타입
 * ========================================================================== */

type SignalGrade = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

type TagCode =
  | 'FOREIGN_BUYING'
  | 'INSTITUTION_BUYING'
  | 'BOTH_BUYING'
  | 'STREAK_BUYING'
  | 'FOREIGN_SELLING'
  | 'UNDERVALUED'
  | 'OVERVALUED'
  | 'HIGH_DIVIDEND'
  | 'MOMENTUM_UP';

interface SignalSummary {
  stockCode: string;
  stockName: string;
  sectorName: string | null;
  baseDate: string;
  totalScore: number;
  grade: SignalGrade;
  confidence: number;
  closePrice: number | null;
  changeRate: number | null;
  /** 미니 그래프용 최근 종가 (오래된 것 -> 최신) */
  sparkline: number[];
  tags: TagCode[];
}

/** 백엔드 ApiResponse 봉투 */
interface ApiResult<T> {
  success: boolean;
  data: T | null;
  errorCode: string | null;
  message: string | null;
}

type SortKey = 'score' | 'changeRate' | 'name';

/* ============================================================================
 * 등급 / 태그 메타
 * ========================================================================== */

const GRADE_META: Record<SignalGrade, { label: string; className: string }> = {
  STRONG_BUY: { label: '적극 매수 우위', className: 'border-rose-200 text-rose-600' },
  BUY: { label: '매수 우위', className: 'border-rose-200 text-rose-600' },
  NEUTRAL: { label: '중립', className: 'border-slate-200 text-slate-500' },
  SELL: { label: '매도 우위', className: 'border-blue-200 text-blue-600' },
  STRONG_SELL: { label: '적극 매도 우위', className: 'border-blue-200 text-blue-600' },
};

const TAG_META: Record<
  TagCode,
  { label: string; group: '수급' | '밸류에이션' | '가격'; className: string; hint: string }
> = {
  FOREIGN_BUYING: {
    label: '외국인 순매수',
    group: '수급',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    hint: '최근 5거래일 외국인 순매수 대금이 거래대금의 3% 이상',
  },
  INSTITUTION_BUYING: {
    label: '기관 순매수',
    group: '수급',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    hint: '최근 5거래일 기관 순매수 대금이 거래대금의 3% 이상',
  },
  BOTH_BUYING: {
    label: '외국인·기관 동반',
    group: '수급',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    hint: '외국인과 기관이 같은 기간 함께 순매수',
  },
  STREAK_BUYING: {
    label: '연속 순매수',
    group: '수급',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    hint: '3거래일 이상 연속 순매수',
  },
  FOREIGN_SELLING: {
    label: '외국인 순매도',
    group: '수급',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    hint: '최근 5거래일 외국인 순매도 우위',
  },
  UNDERVALUED: {
    label: '저평가',
    group: '밸류에이션',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    hint: '동종 업종 중앙값 대비 PER·PBR이 20% 이상 낮음',
  },
  OVERVALUED: {
    label: '고평가',
    group: '밸류에이션',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    hint: '동종 업종 중앙값 대비 PER·PBR이 20% 이상 높음',
  },
  HIGH_DIVIDEND: {
    label: '고배당',
    group: '밸류에이션',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    hint: '배당수익률 4% 이상',
  },
  MOMENTUM_UP: {
    label: '추세 상승',
    group: '가격',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    hint: '20일 이동평균을 위로 이격, 과열 구간은 제외',
  },
};

const TAG_GROUPS = ['수급', '밸류에이션', '가격'] as const;
const ALL_TAGS = Object.keys(TAG_META) as TagCode[];

/* ============================================================================
 * 표기 유틸
 * ========================================================================== */

function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}

function signedScore(score: number): string {
  return `${score > 0 ? '+' : ''}${score.toFixed(1)}`;
}

function formatDate(isoDate: string): string {
  return isoDate.replace(/-/g, '.');
}

/* API 요청 */
async function fetchSignals(signal: AbortSignal): Promise<SignalSummary[]> {
    // 테스트 시 사용
    if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return MOCK_SIGNALS;
    }

    // 실제 호출
    const query = new URLSearchParams({ limitRaw: String(FETCH_LIMIT)});

    const response = await fetch(`${API_BASE}/api/v1/signals?${query}`, {
        headers: { 'Content-Type': 'application/json' },
        signal,
    });

    // json 변환
    const result = (await response.json()) as ApiResult<SignalSummary[]>; // 형태 지정

    if (!result.success || result.data === null) {
        throw new Error(result.message ?? '목록을 불러오지 못했습니다.');
    }
    return result.data;
}

/* ============================================================================
 * 목 데이터 — USE_MOCK 이 false 가 되면 지워도 된다
 * ========================================================================== */

function makeSparkline(base: number, drift: number): number[] {
  return Array.from({ length: 20 }, (_, i) => {
    const wave = Math.sin(i / 2.5) * base * 0.015;
    return Math.round(base + wave + (drift * base * 0.004 * i) / 2);
  });
}

const MOCK_SIGNALS: SignalSummary[] = [
  {
    stockCode: '005930',
    stockName: '삼성전자',
    sectorName: '반도체',
    baseDate: '2026-09-08',
    totalScore: 62.4,
    grade: 'STRONG_BUY',
    confidence: 0.92,
    closePrice: 78400,
    changeRate: 1.82,
    sparkline: makeSparkline(76000, 3),
    tags: ['FOREIGN_BUYING', 'BOTH_BUYING', 'MOMENTUM_UP'],
  },
  {
    stockCode: '000270',
    stockName: '기아',
    sectorName: '자동차',
    baseDate: '2026-09-08',
    totalScore: 48.1,
    grade: 'BUY',
    confidence: 0.88,
    closePrice: 103500,
    changeRate: 0.73,
    sparkline: makeSparkline(101000, 2),
    tags: ['UNDERVALUED', 'HIGH_DIVIDEND', 'INSTITUTION_BUYING'],
  },
  {
    stockCode: '055550',
    stockName: '신한지주',
    sectorName: '금융',
    baseDate: '2026-09-08',
    totalScore: 34.7,
    grade: 'BUY',
    confidence: 0.41,
    closePrice: 52800,
    changeRate: -0.38,
    sparkline: makeSparkline(53200, -1),
    tags: ['UNDERVALUED', 'HIGH_DIVIDEND'],
  },
  {
    stockCode: '035420',
    stockName: 'NAVER',
    sectorName: '인터넷',
    baseDate: '2026-09-08',
    totalScore: 5.2,
    grade: 'NEUTRAL',
    confidence: 0.76,
    closePrice: 189000,
    changeRate: 0.11,
    sparkline: makeSparkline(188000, 0),
    tags: ['STREAK_BUYING'],
  },
  {
    stockCode: '051910',
    stockName: 'LG화학',
    sectorName: '화학',
    baseDate: '2026-09-08',
    totalScore: -41.6,
    grade: 'SELL',
    confidence: 0.84,
    closePrice: 271500,
    changeRate: -2.14,
    sparkline: makeSparkline(285000, -4),
    tags: ['FOREIGN_SELLING', 'OVERVALUED'],
  },
  {
    stockCode: '207940',
    stockName: '삼성바이오로직스',
    sectorName: '제약',
    baseDate: '2026-09-08',
    totalScore: -58.3,
    grade: 'STRONG_SELL',
    confidence: 0.69,
    closePrice: 812000,
    changeRate: -1.45,
    sparkline: makeSparkline(845000, -3),
    tags: ['FOREIGN_SELLING', 'OVERVALUED'],
  },
];

/* ============================================================================
 * 미니 그래프
 * ========================================================================== */

/**
 * 축도 눈금도 없는 목록용 그래프. 모양만 읽히면 된다.
 * 절대 수준이 아니라 구간 내 최저~최고를 높이에 맞춰 늘린다.
 */
function Sparkline({ values, label }: { values: number[]; label: string }) {
  const width = 100;
  const height = 28;

  if (values.length < 2) {
    return <div className="h-7 w-full" role="img" aria-label={`${label} 추이 없음`} />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // 전 구간 같은 값이면 0으로 나눠진다

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const rising = values[values.length - 1]! >= values[0]!;
  const stroke = rising ? '#e11d48' : '#2563eb'; // 상승 빨강, 하락 파랑 (국내 관행)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-7 w-full"
      role="img"
      aria-label={`${label} 최근 ${values.length}거래일 ${rising ? '상승' : '하락'}`}
    >
      <polygon points={`${points} ${width},${height} 0,${height}`} fill={stroke} opacity="0.08" />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ============================================================================
 * 목록 한 행
 * ========================================================================== */

/**
 * 행 전체가 상세 페이지로 가는 링크다.
 * div + onClick 이 아니라 a 로 감싸면 탭 이동과 새 탭으로 열기가 그냥 따라온다.
 * react-router 를 쓰면 a 를 Link 로 바꾸면 된다.
 */
function StockRow({ signal }: { signal: SignalSummary }) {
  const rising = (signal.changeRate ?? 0) >= 0;
  const grade = GRADE_META[signal.grade];
  const lowConfidence = signal.confidence < 0.5;

  return (
    <li>
      <a
        href={`/stocks/${signal.stockCode}`}
        className={cn(
          'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3',
          'border-b border-slate-100 px-2 py-4 transition-colors hover:bg-slate-50',
          'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-slate-900',
          'sm:grid-cols-[minmax(0,1fr)_7rem_6rem_5.5rem]',
        )}
      >
        {/* 종목명 + 태그 */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="truncate font-medium text-slate-900">{signal.stockName}</span>
            <span className="shrink-0 text-xs text-slate-400 [font-variant-numeric:tabular-nums]">
              {signal.stockCode}
            </span>
            {signal.sectorName && (
              <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">
                {signal.sectorName}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {signal.tags.length > 0 ? (
              signal.tags.map((tag) => (
                <span
                  key={tag}
                  title={TAG_META[tag].hint}
                  className={cn(
                    'inline-block whitespace-nowrap rounded border px-1.5 py-0.5 text-xs',
                    TAG_META[tag].className,
                  )}
                >
                  {TAG_META[tag].label}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">특이 신호 없음</span>
            )}
          </div>
        </div>

        {/* 미니 그래프 — 좁은 화면에서는 감춘다 */}
        <div className="hidden sm:block">
          <Sparkline values={signal.sparkline} label={signal.stockName} />
        </div>

        {/* 현재가 · 등락률 */}
        <div className="text-right [font-variant-numeric:tabular-nums]">
          <div className="text-sm text-slate-900">
            {signal.closePrice?.toLocaleString('ko-KR') ?? '—'}
          </div>
          <div className={cn('text-xs', rising ? 'text-rose-600' : 'text-blue-600')}>
            {signal.changeRate === null
              ? '—'
              : `${rising ? '+' : ''}${signal.changeRate.toFixed(2)}%`}
          </div>
        </div>

        {/* 판정 */}
        <div className="text-right">
          <span
            className={cn(
              'inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs',
              grade.className,
            )}
          >
            {grade.label}
          </span>
          <div className="mt-1 text-xs text-slate-500 [font-variant-numeric:tabular-nums]">
            {signedScore(signal.totalScore)}
            {lowConfidence && (
              <span className="ml-1 text-amber-600" title="데이터가 부족한 지표가 많습니다">
                {Math.round(signal.confidence * 100)}%
              </span>
            )}
          </div>
        </div>
      </a>
    </li>
  );
}

/* ============================================================================
 * 메인 페이지
 * ========================================================================== */

export default function HomePage() {
  const [signals, setSignals] = useState<SignalSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagCode[]>([]);
  const [sort, setSort] = useState<SortKey>('score');

  /* --- 목록 요청 --------------------------------------------------------- */
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchSignals(controller.signal)
      .then((data) => {
        setSignals(data);
        setIsLoading(false);
      })
      .catch((e: unknown) => {
        // 언마운트로 인한 취소는 에러로 취급하지 않는다
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadToken]);

  /* --- 검색어 디바운스 --------------------------------------------------- */
  useEffect(() => {
    // 타이핑할 때마다 필터가 도는 걸 막는다. cleanup 에서 반드시 타이머를 정리할 것.
    const timer = setTimeout(() => setKeyword(keywordInput), 250);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  /* --- 필터링 + 정렬 ----------------------------------------------------- */
  const visible = useMemo(() => {
    const needle = keyword.trim().toLowerCase();

    return signals
      .filter((s) => {
        const matchesKeyword =
          !needle ||
          s.stockCode.includes(needle) ||
          s.stockName.toLowerCase().includes(needle);

        // AND 조건 — "외국인 순매수이면서 저평가"를 찾는 것이 이 화면의 주 용도.
        // OR 로 바꾸려면 every 를 some 으로.
        const matchesTags = selectedTags.every((tag) => s.tags.includes(tag));

        return matchesKeyword && matchesTags;
      })
      .sort((a, b) => {
        switch (sort) {
          case 'changeRate':
            return (b.changeRate ?? 0) - (a.changeRate ?? 0);
          case 'name':
            return a.stockName.localeCompare(b.stockName, 'ko');
          default:
            return b.totalScore - a.totalScore;
        }
      });
  }, [signals, keyword, selectedTags, sort]);

  const isFiltered = keyword !== '' || selectedTags.length > 0;
  const baseDate = signals[0]?.baseDate;

  const toggleTag = (tag: TagCode) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setKeywordInput('');
    setKeyword('');
    setSelectedTags([]);
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          종목 둘러보기
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          외국인·기관의 순매수 흐름과 업종 대비 밸류에이션으로 종목에 태그를 붙였습니다.
          {baseDate && ` ${formatDate(baseDate)} 종가 기준입니다.`}
        </p>
      </header>

      {/* --- 검색 --- */}
      <div className="relative">
        <label htmlFor="stock-search" className="sr-only">
          종목 검색
        </label>
        <input
          id="stock-search"
          type="search"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="종목명 또는 종목코드"
          autoComplete="off"
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
        />
        {keywordInput && (
          <button
            type="button"
            onClick={() => setKeywordInput('')}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        )}
      </div>

      {/* --- 태그 필터 (그룹별로 묶어야 무엇끼리 배타적인지 읽힌다) --- */}
      <div className="mt-5 space-y-3">
        {TAG_GROUPS.map((group) => (
          <div key={group} className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-xs text-slate-400">{group}</span>

            {ALL_TAGS.filter((tag) => TAG_META[tag].group === group).map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  aria-pressed={active}
                  title={TAG_META[tag].hint}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 text-slate-600 hover:border-slate-400',
                  )}
                >
                  {TAG_META[tag].label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* --- 건수 + 정렬 --- */}
      <div className="mb-3 mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500 [font-variant-numeric:tabular-nums]">
          {isLoading ? '불러오는 중' : `${visible.length}개 종목`}
          {isFiltered && !isLoading && (
            <>
              <span className="text-slate-300"> / {signals.length}</span>
              <button
                type="button"
                onClick={clearFilters}
                className="ml-3 text-slate-500 underline underline-offset-4 hover:text-slate-800"
              >
                조건 지우기
              </button>
            </>
          )}
        </p>

        <label className="flex items-center gap-2 text-sm text-slate-500">
          <span className="sr-only">정렬 기준</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
          >
            <option value="score">점수 높은 순</option>
            <option value="changeRate">등락률 높은 순</option>
            <option value="name">종목명 순</option>
          </select>
        </label>
      </div>

      {/* --- 로딩 --- */}
      {isLoading && (
        <div className="space-y-2" aria-busy="true" aria-label="불러오는 중">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      )}

      {/* --- 에러: 무엇이 잘못됐고 무엇을 하면 되는지 --- */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setReloadToken((n) => n + 1)}
            className="mt-3 underline underline-offset-4"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* --- 결과 없음 --- */}
      {!isLoading && !error && visible.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-slate-600">조건에 맞는 종목이 없습니다.</p>
          <p className="mt-1 text-sm text-slate-400">
            {selectedTags.length > 1
              ? '태그는 모두 만족하는 종목만 찾습니다. 하나씩 빼보세요.'
              : '검색어를 지우거나 다른 태그를 골라보세요.'}
          </p>
        </div>
      )}

      {/* --- 목록 --- */}
      {!isLoading && !error && visible.length > 0 && (
        <>
          <div className="hidden grid-cols-[minmax(0,1fr)_7rem_6rem_5.5rem] gap-x-4 border-b border-slate-200 px-2 pb-2 text-xs text-slate-400 sm:grid">
            <span>종목 · 신호</span>
            <span>20일 추이</span>
            <span className="text-right">현재가</span>
            <span className="text-right">판정</span>
          </div>

          <ul className="border-t border-slate-200 sm:border-t-0">
            {visible.map((signal) => (
              <StockRow key={signal.stockCode} signal={signal} />
            ))}
          </ul>
        </>
      )}

      <p className="mt-10 text-xs leading-relaxed text-slate-400">
        점수는 과거 수급·재무 데이터에 대한 해석입니다. 투자 판단의 근거로 삼기 전에
        스스로 확인하세요. 미래 수익을 보장하지 않습니다.
      </p>
    </main>
  );
}
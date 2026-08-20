import { useState, useMemo } from "react";
import {
  Search,
  Info,
  Wallet,
  Users,
  Scale,
  Activity,
  TrendingUp,
  Coins,
  ShieldCheck,
  Check,
  X,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------
 * StockTracer — 메인 페이지
 * 초보자가 "무엇을 왜 사고 파는지" 이해한 상태로 주문하도록 돕는 화면.
 *
 * 색 규칙(국내 증시 관행): 상승/매수 = 빨강, 하락/매도 = 파랑,
 * 브랜드/중립 UI = 딥 그린. 신호색과 UI색을 섞지 않는다.
 * ------------------------------------------------------------------ */

const C = {
  ink: "#101B2C",
  ink70: "#3D4B5F",
  ink45: "#6E7C90",
  line: "#DDE3EC",
  paper: "#EBEEF4",
  card: "#FFFFFF",
  up: "#DF2F4A",
  upSoft: "#FDEBEE",
  down: "#2A62C8",
  downSoft: "#E9F0FC",
  brand: "#0E4F4A",
  brandSoft: "#E3EFEC",
  hl: "#FFE27A",
};

/* ---------------------------- 타입 ---------------------------- */

type LensId = "flow" | "value" | "volume" | "trend" | "dividend" | "safe";

interface StockMetrics {
  per: number; // 주가수익비율
  pbr: number; // 주가순자산비율
  roe: number; // 자기자본이익률 (%)
  divYield: number; // 배당수익률 (%)
  debtRatio: number; // 부채비율 (%)
  foreignNet: number; // 외국인 5일 순매수 (억원)
  instNet: number; // 기관 5일 순매수 (억원)
  volRatio: number; // 평소 거래량 대비 배수
}

interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changeRate: number;
  spark: number[];
  lenses: LensId[];
  score: number; // 0~100, 선택한 관점에서의 적합도
  reason: string; // 쉬운 말 한 줄 근거
  metrics: StockMetrics;
}

interface Lens {
  id: LensId;
  easy: string;
  pro: string;
  desc: string;
  icon: typeof Users;
}

/* ------------------------- 관점(필터) 정의 -------------------------
 * 실제 연동 시: GET /api/v1/screener?lens={id}&market=ALL
 * ---------------------------------------------------------------- */

const LENSES: Lens[] = [
  {
    id: "flow",
    easy: "외국인·기관이 담은 종목",
    pro: "투자자별 순매수 상위",
    desc: "큰돈을 굴리는 외국인 투자자와 기관(연기금·자산운용사)이 최근 5일 동안 사들인 양이 많은 종목이에요. 이들은 회사를 오래 조사하고 사는 편이라, 관심의 방향을 보는 힌트가 됩니다.",
    icon: Users,
  },
  {
    id: "value",
    easy: "버는 돈에 비해 싼 회사",
    pro: "저PER · 저PBR",
    desc: "회사가 1년에 버는 이익이나 갖고 있는 재산에 비해 주가가 낮게 매겨진 종목이에요. 싼 데는 이유가 있을 수 있으니, 이익이 줄고 있진 않은지 함께 봐야 합니다.",
    icon: Scale,
  },
  {
    id: "volume",
    easy: "갑자기 거래가 늘어난 종목",
    pro: "거래량 급증",
    desc: "평소보다 사고파는 양이 크게 늘어난 종목이에요. 좋은 소식일 수도, 나쁜 소식일 수도 있으니 뉴스를 꼭 함께 확인하세요.",
    icon: Activity,
  },
  {
    id: "trend",
    easy: "꾸준히 오르는 종목",
    pro: "상승 추세 지속",
    desc: "짧게 튀어오른 게 아니라, 몇 주에 걸쳐 완만하게 올라온 종목이에요. 이미 많이 오른 뒤일 수 있다는 점도 같이 생각해 보세요.",
    icon: TrendingUp,
  },
  {
    id: "dividend",
    easy: "배당 잘 주는 회사",
    pro: "고배당 수익률",
    desc: "이익의 일부를 주주에게 현금으로 나눠주는 비율이 높은 종목이에요. 주가가 크게 오르지 않아도 은행 이자처럼 받는 걸 기대할 수 있습니다.",
    icon: Coins,
  },
  {
    id: "safe",
    easy: "빚 적고 튼튼한 회사",
    pro: "재무 안정성 상위",
    desc: "갚아야 할 돈이 적고 이익을 꾸준히 내는 종목이에요. 시장이 흔들릴 때 상대적으로 덜 휘청이는 편입니다.",
    icon: ShieldCheck,
  },
];

/* --------------------------- 샘플 데이터 ---------------------------
 * 실제 연동 전까지 쓰는 목 데이터. 응답 스키마는 Stock 인터페이스와 동일.
 * ---------------------------------------------------------------- */

const MOCK_STOCKS: Stock[] = [
  {
    ticker: "005930",
    name: "삼성전자",
    sector: "반도체",
    price: 78400,
    change: 1500,
    changeRate: 1.95,
    spark: [72, 71, 73, 74, 73, 76, 75, 77, 76, 78, 77, 78.4],
    lenses: ["flow", "safe", "trend"],
    score: 92,
    reason: "외국인이 5일 연속 사들였고, 빚이 적어 흔들림이 덜한 편이에요.",
    metrics: { per: 12.4, pbr: 1.2, roe: 9.8, divYield: 1.9, debtRatio: 26, foreignNet: 4820, instNet: 910, volRatio: 1.3 },
  },
  {
    ticker: "000660",
    name: "SK하이닉스",
    sector: "반도체",
    price: 196500,
    change: 6500,
    changeRate: 3.42,
    spark: [168, 172, 170, 176, 181, 179, 185, 188, 186, 191, 190, 196.5],
    lenses: ["flow", "trend", "volume"],
    score: 88,
    reason: "기관이 크게 담았고, 몇 주째 방향을 바꾸지 않고 올라왔어요.",
    metrics: { per: 9.1, pbr: 1.8, roe: 21.4, divYield: 0.7, debtRatio: 41, foreignNet: 3110, instNet: 2240, volRatio: 2.1 },
  },
  {
    ticker: "055550",
    name: "신한지주",
    sector: "은행",
    price: 52300,
    change: -400,
    changeRate: -0.76,
    spark: [50, 51, 52, 51, 53, 52, 53, 54, 53, 53, 52.7, 52.3],
    lenses: ["value", "dividend", "safe"],
    score: 85,
    reason: "1년 버는 돈에 비해 주가가 낮고, 배당을 꾸준히 주는 곳이에요.",
    metrics: { per: 5.2, pbr: 0.42, roe: 8.6, divYield: 5.4, debtRatio: 38, foreignNet: 640, instNet: 180, volRatio: 0.9 },
  },
  {
    ticker: "005380",
    name: "현대차",
    sector: "자동차",
    price: 243000,
    change: 3500,
    changeRate: 1.46,
    spark: [228, 231, 229, 234, 236, 233, 238, 240, 237, 241, 239, 243],
    lenses: ["value", "flow", "dividend"],
    score: 83,
    reason: "이익에 비해 주가가 낮은데, 외국인 매수가 함께 들어오고 있어요.",
    metrics: { per: 4.9, pbr: 0.58, roe: 12.1, divYield: 4.6, debtRatio: 44, foreignNet: 1880, instNet: 420, volRatio: 1.1 },
  },
  {
    ticker: "035420",
    name: "NAVER",
    sector: "인터넷",
    price: 188200,
    change: -2800,
    changeRate: -1.47,
    spark: [201, 199, 197, 198, 194, 196, 192, 193, 190, 191, 190.5, 188.2],
    lenses: ["value", "safe"],
    score: 71,
    reason: "주가는 내려왔지만 회사가 버는 돈은 유지되고 있어요.",
    metrics: { per: 16.8, pbr: 1.1, roe: 6.9, divYield: 0.5, debtRatio: 31, foreignNet: -320, instNet: 260, volRatio: 1.0 },
  },
  {
    ticker: "373220",
    name: "LG에너지솔루션",
    sector: "2차전지",
    price: 361000,
    change: 14000,
    changeRate: 4.03,
    spark: [332, 329, 335, 338, 334, 341, 345, 343, 350, 348, 347, 361],
    lenses: ["volume", "flow"],
    score: 76,
    reason: "평소보다 거래가 3배 넘게 늘었어요. 관련 뉴스를 꼭 확인하세요.",
    metrics: { per: 42.5, pbr: 3.4, roe: 5.2, divYield: 0.1, debtRatio: 72, foreignNet: 2050, instNet: 1130, volRatio: 3.4 },
  },
  {
    ticker: "033780",
    name: "KT&G",
    sector: "필수소비재",
    price: 118900,
    change: 900,
    changeRate: 0.76,
    spark: [112, 113, 114, 113, 115, 116, 115, 117, 116, 118, 118, 118.9],
    lenses: ["dividend", "safe", "value"],
    score: 87,
    reason: "배당을 오래 안 끊고 준 회사예요. 주가 흔들림도 작은 편입니다.",
    metrics: { per: 11.3, pbr: 1.3, roe: 11.4, divYield: 5.1, debtRatio: 19, foreignNet: 410, instNet: 330, volRatio: 0.8 },
  },
  {
    ticker: "051910",
    name: "LG화학",
    sector: "화학",
    price: 298500,
    change: -6500,
    changeRate: -2.13,
    spark: [322, 318, 320, 315, 311, 314, 308, 310, 305, 303, 305, 298.5],
    lenses: ["value", "volume"],
    score: 64,
    reason: "많이 내려와 싸 보이지만, 이익도 함께 줄고 있어 주의가 필요해요.",
    metrics: { per: 22.7, pbr: 0.71, roe: 3.1, divYield: 1.4, debtRatio: 88, foreignNet: -910, instNet: -240, volRatio: 2.6 },
  },
  {
    ticker: "012330",
    name: "현대모비스",
    sector: "자동차부품",
    price: 264000,
    change: 4000,
    changeRate: 1.54,
    spark: [246, 249, 247, 252, 254, 251, 256, 258, 257, 260, 261, 264],
    lenses: ["value", "safe", "trend"],
    score: 81,
    reason: "가진 재산에 비해 주가가 낮고, 빚 부담이 작아요.",
    metrics: { per: 6.8, pbr: 0.49, roe: 7.4, divYield: 2.3, debtRatio: 22, foreignNet: 720, instNet: 510, volRatio: 1.2 },
  },
  {
    ticker: "086790",
    name: "하나금융지주",
    sector: "은행",
    price: 68400,
    change: 700,
    changeRate: 1.03,
    spark: [63, 64, 65, 64, 66, 65, 66, 67, 66, 68, 67.6, 68.4],
    lenses: ["dividend", "value", "flow"],
    score: 84,
    reason: "배당수익률이 높고, 기관이 조용히 사 모으는 중이에요.",
    metrics: { per: 4.7, pbr: 0.45, roe: 9.9, divYield: 6.0, debtRatio: 36, foreignNet: 980, instNet: 640, volRatio: 1.4 },
  },
  {
    ticker: "247540",
    name: "에코프로비엠",
    sector: "2차전지",
    price: 142800,
    change: 9200,
    changeRate: 6.89,
    spark: [121, 118, 124, 127, 125, 131, 129, 134, 132, 136, 133.6, 142.8],
    lenses: ["volume", "trend"],
    score: 58,
    reason: "거래가 폭발적으로 늘며 급하게 올랐어요. 변동이 큰 종목입니다.",
    metrics: { per: 68.2, pbr: 6.1, roe: 4.8, divYield: 0.0, debtRatio: 96, foreignNet: 340, instNet: -180, volRatio: 4.7 },
  },
  {
    ticker: "017670",
    name: "SK텔레콤",
    sector: "통신",
    price: 57900,
    change: 200,
    changeRate: 0.35,
    spark: [55, 55.4, 56, 55.8, 56.5, 56.2, 57, 56.8, 57.2, 57.5, 57.7, 57.9],
    lenses: ["dividend", "safe"],
    score: 82,
    reason: "매년 비슷한 배당을 주고, 주가가 크게 출렁이지 않아요.",
    metrics: { per: 10.2, pbr: 0.94, roe: 9.1, divYield: 6.3, debtRatio: 47, foreignNet: 260, instNet: 190, volRatio: 0.7 },
  },
];

const INDICES = [
  { name: "코스피", value: 2748.32, change: 21.4, rate: 0.78 },
  { name: "코스닥", value: 862.17, change: -4.9, rate: -0.57 },
  { name: "원/달러", value: 1362.5, change: 3.2, rate: 0.24 },
];

const HOLDINGS = [
  { ticker: "005930", name: "삼성전자", qty: 12, avg: 74200, price: 78400 },
  { ticker: "033780", name: "KT&G", qty: 5, avg: 121000, price: 118900 },
];

const CASH = 3_140_000;

/* --------------------------- 유틸 --------------------------- */

const won = (n: number) => n.toLocaleString("ko-KR");
const signed = (n: number, digits = 2) => `${n > 0 ? "+" : ""}${n.toFixed(digits)}`;
const toneOf = (n: number) => (n > 0 ? C.up : n < 0 ? C.down : C.ink45);

/* ------------------------ 작은 컴포넌트 ------------------------ */

/** 주가 흐름 미니 그래프 (최근 12영업일) */
function Sparkline({ data, tone }: { data: number[]; tone: string }) {
  const w = 92;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="overflow-visible">
      <polyline points={pts} fill="none" stroke={tone} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={w}
        cy={h - ((data[data.length - 1] - min) / span) * (h - 4) - 2}
        r="2.6"
        fill={tone}
      />
    </svg>
  );
}

/** 용어 옆 물음표 — 누르면 뜻 풀이가 열린다 */
function TermHint({ label, body }: { label: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${label} 설명 보기`}
        className="st-focus ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full align-middle"
        style={{ background: C.paper, color: C.ink45 }}
      >
        <Info size={11} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-6 left-1/2 z-30 w-60 -translate-x-1/2 rounded-lg p-3 text-[12px] leading-relaxed shadow-lg"
          style={{ background: C.ink, color: "#fff" }}
        >
          <span className="mb-1 block font-semibold">{label}</span>
          <span style={{ color: "#C6CFDC" }}>{body}</span>
        </span>
      )}
    </span>
  );
}

/** 종목이 뽑힌 이유 태그 */
function SignalTag({ text }: { text: string }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[11px] font-medium"
      style={{ background: C.brandSoft, color: C.brand }}
    >
      {text}
    </span>
  );
}

/* --------------------------- 메인 --------------------------- */

export default function StockTracerHome() {
  const [easy, setEasy] = useState(true); // 쉬운 말 ↔ 원래 용어
  const [lens, setLens] = useState<LensId>("flow");
  const [picked, setPicked] = useState<Stock>(MOCK_STOCKS[0]);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState(1);
  const [query, setQuery] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const activeLens = LENSES.find((l) => l.id === lens)!;

  const list = useMemo(() => {
    return MOCK_STOCKS.filter((s) => s.lenses.includes(lens))
      .filter((s) => (query ? s.name.includes(query) || s.ticker.includes(query) : true))
      .sort((a, b) => b.score - a.score);
  }, [lens, query]);

  const amount = picked.price * qty;
  const fee = Math.floor(amount * 0.00015);
  const tax = side === "sell" ? Math.floor(amount * 0.0018) : 0;
  const total = side === "buy" ? amount + fee : amount - fee - tax;
  const weight = Math.min(100, Math.round((amount / CASH) * 100));
  const heavy = side === "buy" && weight > 40;
  const overCash = side === "buy" && amount + fee > CASH;

  const submit = () => {
    setDone(`${picked.name} ${won(qty)}주 ${side === "buy" ? "사기" : "팔기"} 연습 주문을 냈어요.`);
    setTimeout(() => setDone(null), 3200);
  };

  return (
    <div className="min-h-screen w-full" style={{ background: C.paper, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap');
        .st-display { font-family: 'Gowun Batang', 'Nanum Myeongjo', serif; }
        .st-body { font-family: 'Pretendard', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; }
        .st-mark {
          background-image: linear-gradient(transparent 56%, ${C.hl} 56%, ${C.hl} 94%, transparent 94%);
          padding: 0 .1em;
        }
        .st-focus:focus-visible { outline: 2px solid ${C.brand}; outline-offset: 2px; }
        .st-row { transition: background-color .15s ease, transform .15s ease; }
        @media (prefers-reduced-motion: reduce) { .st-row { transition: none; } }
      `}</style>

      <div className="st-body mx-auto max-w-6xl px-4 pb-20 pt-5 sm:px-6">
        {/* ── 상단 바 ───────────────────────────────── */}
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="st-display text-[22px] font-bold tracking-tight">StockTracer</span>
            <span className="text-[12px]" style={{ color: C.ink45 }}>
              초보자용 주식 분석
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 시그니처: 화면 전체 용어를 한 번에 바꾸는 스위치 */}
            <button
              type="button"
              onClick={() => setEasy((v) => !v)}
              className="st-focus flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium"
              style={{ borderColor: C.line, background: C.card }}
              aria-pressed={easy}
            >
              <span
                className="inline-block h-3.5 w-6 rounded-full p-0.5"
                style={{ background: easy ? C.brand : C.line }}
              >
                <span
                  className="block h-2.5 w-2.5 rounded-full bg-white"
                  style={{ transform: easy ? "translateX(10px)" : "none", transition: "transform .15s" }}
                />
              </span>
              {easy ? "쉬운 말로 보는 중" : "원래 용어로 보는 중"}
            </button>

            <div
              className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] sm:flex"
              style={{ borderColor: C.line, background: C.card }}
            >
              <Wallet size={13} style={{ color: C.brand }} />
              <span style={{ color: C.ink45 }}>쓸 수 있는 돈</span>
              <strong className="tabular-nums">{won(CASH)}원</strong>
            </div>
          </div>
        </header>

        {/* ── 지수 티커 ─────────────────────────────── */}
        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 rounded-xl border px-4 py-2.5" style={{ borderColor: C.line, background: C.card }}>
          {INDICES.map((i) => (
            <div key={i.name} className="flex items-baseline gap-2 text-[13px]">
              <span style={{ color: C.ink45 }}>{i.name}</span>
              <strong className="tabular-nums">{i.value.toLocaleString("ko-KR")}</strong>
              <span className="tabular-nums text-[12px]" style={{ color: toneOf(i.rate) }}>
                {signed(i.change, 1)} ({signed(i.rate)}%)
              </span>
            </div>
          ))}
          <span className="ml-auto self-center text-[11px]" style={{ color: C.ink45 }}>
            8월 12일 오후 3시 30분 마감 · 샘플 데이터
          </span>
        </div>

        {/* ── 히어로 ───────────────────────────────── */}
        <section className="mb-7">
          <h1 className="st-display text-[26px] leading-snug sm:text-[34px]">
            어려운 지표는 저희가 읽을게요.
            <br />
            <span className="st-mark font-bold">고르는 일만 하세요.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed" style={{ color: C.ink70 }}>
            아래 여섯 가지 관점 중 하나를 고르면, 그 기준에 맞는 종목만 모아서 보여드려요. 종목마다{" "}
            <strong>왜 뽑혔는지</strong> 한 줄로 설명하고, 모르는 단어 옆에는 물음표를 붙여 뒀습니다.
          </p>
        </section>

        {/* ── 관점 고르기 ──────────────────────────── */}
        <section className="mb-5">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-[12px] font-semibold tracking-wide" style={{ color: C.ink45 }}>
              어떤 기준으로 찾아볼까요
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {LENSES.map((l) => {
              const on = l.id === lens;
              const Icon = l.icon;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLens(l.id)}
                  aria-pressed={on}
                  className="st-focus st-row flex h-full flex-col items-start gap-1.5 rounded-xl border p-3 text-left"
                  style={{
                    borderColor: on ? C.brand : C.line,
                    background: on ? C.brand : C.card,
                    color: on ? "#fff" : C.ink,
                  }}
                >
                  <Icon size={16} style={{ color: on ? C.hl : C.brand }} />
                  <span className="text-[12.5px] font-semibold leading-tight">{easy ? l.easy : l.pro}</span>
                  <span className="text-[11px] leading-tight" style={{ color: on ? "#A9C4C0" : C.ink45 }}>
                    {easy ? l.pro : l.easy}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 고른 관점 설명 */}
        <div className="mb-6 rounded-xl border-l-4 p-4" style={{ borderColor: C.brand, background: C.card }}>
          <p className="text-[13px] leading-relaxed" style={{ color: C.ink70 }}>
            <strong style={{ color: C.ink }}>{easy ? activeLens.easy : activeLens.pro}</strong> — {activeLens.desc}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* ── 종목 리스트 ────────────────────────── */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-bold">
                조건에 맞는 종목 <span className="tabular-nums" style={{ color: C.brand }}>{list.length}</span>개
              </h2>
              <div
                className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                style={{ borderColor: C.line, background: C.card }}
              >
                <Search size={14} style={{ color: C.ink45 }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="종목명 또는 코드"
                  aria-label="종목 검색"
                  className="st-focus w-32 bg-transparent text-[13px] outline-none sm:w-44"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기" className="st-focus">
                    <X size={13} style={{ color: C.ink45 }} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {list.map((s) => {
                const on = s.ticker === picked.ticker;
                const tone = toneOf(s.changeRate);
                return (
                  <button
                    key={s.ticker}
                    type="button"
                    onClick={() => {
                      setPicked(s);
                      setQty(1);
                    }}
                    aria-pressed={on}
                    className="st-focus st-row block w-full rounded-xl border p-3.5 text-left"
                    style={{
                      borderColor: on ? C.brand : C.line,
                      background: C.card,
                      boxShadow: on ? `inset 3px 0 0 ${C.brand}` : "none",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* 적합도 점수 */}
                      <div
                        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg"
                        style={{ background: C.brandSoft }}
                      >
                        <span className="st-display text-[16px] font-bold leading-none tabular-nums" style={{ color: C.brand }}>
                          {s.score}
                        </span>
                        <span className="mt-0.5 text-[9px]" style={{ color: C.brand }}>
                          점
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-[15px] font-bold">{s.name}</span>
                          <span className="text-[11px] tabular-nums" style={{ color: C.ink45 }}>
                            {s.ticker} · {s.sector}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: C.ink70 }}>
                          {s.reason}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {s.lenses.map((id) => {
                            const l = LENSES.find((x) => x.id === id)!;
                            return <SignalTag key={id} text={easy ? l.easy : l.pro} />;
                          })}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="hidden justify-end sm:flex">
                          <Sparkline data={s.spark} tone={tone} />
                        </div>
                        <div className="mt-1 text-[15px] font-bold tabular-nums">{won(s.price)}원</div>
                        <div className="text-[12px] font-medium tabular-nums" style={{ color: tone }}>
                          {signed(s.change, 0)} ({signed(s.changeRate)}%)
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {list.length === 0 && (
                <div className="rounded-xl border border-dashed p-10 text-center" style={{ borderColor: C.line }}>
                  <p className="text-[13px] font-medium">검색어와 맞는 종목이 이 기준에는 없어요.</p>
                  <p className="mt-1 text-[12px]" style={{ color: C.ink45 }}>
                    검색어를 지우거나 위에서 다른 기준을 골라 보세요.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── 오른쪽: 상세 + 주문 ──────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
            {/* 지표 카드 */}
            <div className="rounded-xl border p-4" style={{ borderColor: C.line, background: C.card }}>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h3 className="text-[15px] font-bold">{picked.name}</h3>
                  <span className="text-[11px] tabular-nums" style={{ color: C.ink45 }}>
                    {picked.ticker}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-bold tabular-nums">{won(picked.price)}원</div>
                  <div className="text-[12px] tabular-nums" style={{ color: toneOf(picked.changeRate) }}>
                    {signed(picked.changeRate)}%
                  </div>
                </div>
              </div>

              <dl className="space-y-2 border-t pt-3 text-[12.5px]" style={{ borderColor: C.line }}>
                <Metric
                  easy={easy}
                  easyLabel="번 돈 대비 주가"
                  proLabel="PER"
                  hint="지금 주가가 1년 순이익의 몇 배인지를 뜻해요. 숫자가 낮을수록 이익에 비해 저렴하다는 의미입니다. 보통 10배 아래면 싼 편으로 봅니다."
                  value={`${picked.metrics.per.toFixed(1)}배`}
                />
                <Metric
                  easy={easy}
                  easyLabel="가진 재산 대비 주가"
                  proLabel="PBR"
                  hint="회사가 가진 순재산 대비 주가 비율이에요. 1배보다 낮으면 재산보다 싸게 거래되고 있다는 뜻입니다."
                  value={`${picked.metrics.pbr.toFixed(2)}배`}
                />
                <Metric
                  easy={easy}
                  easyLabel="돈 버는 효율"
                  proLabel="ROE"
                  hint="주주 돈 100원으로 1년에 몇 원을 벌었는지예요. 높을수록 장사를 잘하는 회사입니다."
                  value={`${picked.metrics.roe.toFixed(1)}%`}
                />
                <Metric
                  easy={easy}
                  easyLabel="1년에 받는 배당"
                  proLabel="배당수익률"
                  hint="지금 가격에 사면 1년 뒤 받게 될 배당금이 몇 %인지예요. 예금 이자와 비교해 보면 감이 옵니다."
                  value={`${picked.metrics.divYield.toFixed(1)}%`}
                />
                <Metric
                  easy={easy}
                  easyLabel="빚 부담"
                  proLabel="부채비율"
                  hint="자기 돈 대비 빌린 돈의 비율이에요. 100% 아래면 안정적인 편, 200%를 넘으면 부담이 큰 편으로 봅니다."
                  value={`${picked.metrics.debtRatio}%`}
                />
                <Metric
                  easy={easy}
                  easyLabel="외국인이 5일간 산 금액"
                  proLabel="외국인 순매수"
                  hint="외국인 투자자가 산 금액에서 판 금액을 뺀 값이에요. 플러스면 순수하게 사 모으는 중입니다."
                  value={`${signed(picked.metrics.foreignNet, 0)}억`}
                  tone={toneOf(picked.metrics.foreignNet)}
                />
                <Metric
                  easy={easy}
                  easyLabel="평소보다 늘어난 거래"
                  proLabel="거래량 배수"
                  hint="최근 20일 평균 거래량과 비교한 값이에요. 2배가 넘으면 무슨 일이 생겼는지 뉴스를 확인해 보세요."
                  value={`${picked.metrics.volRatio.toFixed(1)}배`}
                />
              </dl>
            </div>

            {/* 주문 위젯 */}
            <div className="rounded-xl border p-4" style={{ borderColor: C.line, background: C.card }}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[14px] font-bold">주문 넣기</h3>
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: C.paper, color: C.ink45 }}>
                  연습 모드
                </span>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-1.5">
                {(["buy", "sell"] as const).map((k) => {
                  const on = side === k;
                  const col = k === "buy" ? C.up : C.down;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setSide(k)}
                      aria-pressed={on}
                      className="st-focus rounded-lg border py-2 text-[13px] font-bold"
                      style={{
                        borderColor: on ? col : C.line,
                        background: on ? (k === "buy" ? C.upSoft : C.downSoft) : C.card,
                        color: on ? col : C.ink45,
                      }}
                    >
                      {k === "buy" ? "사기" : "팔기"}
                    </button>
                  );
                })}
              </div>

              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: C.ink70 }}>
                몇 주 살까요
              </label>
              <div className="mb-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="1주 줄이기"
                  className="st-focus h-9 w-9 rounded-lg border text-[16px]"
                  style={{ borderColor: C.line }}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  aria-label="주문 수량"
                  className="st-focus h-9 flex-1 rounded-lg border text-center text-[14px] font-bold tabular-nums"
                  style={{ borderColor: C.line }}
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="1주 늘리기"
                  className="st-focus h-9 w-9 rounded-lg border text-[16px]"
                  style={{ borderColor: C.line }}
                >
                  +
                </button>
              </div>

              <dl className="mb-3 space-y-1.5 rounded-lg p-3 text-[12.5px]" style={{ background: C.paper }}>
                <Row label="주식값" value={`${won(amount)}원`} />
                <Row label="수수료 (0.015%)" value={`${won(fee)}원`} />
                {side === "sell" && <Row label="세금 (0.18%)" value={`${won(tax)}원`} />}
                <div className="border-t pt-1.5" style={{ borderColor: C.line }}>
                  <Row
                    label={side === "buy" ? "낼 돈" : "받을 돈"}
                    value={`${won(total)}원`}
                    strong
                    tone={side === "buy" ? C.up : C.down}
                  />
                </div>
              </dl>

              {heavy && !overCash && (
                <p className="mb-2 rounded-lg p-2.5 text-[12px] leading-relaxed" style={{ background: C.upSoft, color: C.up }}>
                  이 한 종목에 가진 돈의 <strong>{weight}%</strong>를 쓰게 돼요. 처음에는 한 종목에 20~30% 아래로 나눠 담는 편이 안전합니다.
                </p>
              )}
              {overCash && (
                <p className="mb-2 rounded-lg p-2.5 text-[12px] leading-relaxed" style={{ background: C.upSoft, color: C.up }}>
                  쓸 수 있는 돈보다 <strong>{won(amount + fee - CASH)}원</strong> 모자라요. 수량을 줄이거나 돈을 더 넣어 주세요.
                </p>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={overCash}
                className="st-focus w-full rounded-lg py-2.5 text-[14px] font-bold text-white disabled:opacity-40"
                style={{ background: side === "buy" ? C.up : C.down }}
              >
                {picked.name} {won(qty)}주 {side === "buy" ? "사기" : "팔기"}
              </button>

              {done && (
                <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: C.brand }}>
                  <Check size={13} /> {done}
                </p>
              )}
            </div>

            {/* 내 보유 종목 */}
            <div className="rounded-xl border p-4" style={{ borderColor: C.line, background: C.card }}>
              <h3 className="mb-2.5 text-[14px] font-bold">내가 가진 주식</h3>
              <ul className="space-y-2">
                {HOLDINGS.map((h) => {
                  const pl = (h.price - h.avg) * h.qty;
                  const rate = ((h.price - h.avg) / h.avg) * 100;
                  return (
                    <li key={h.ticker} className="flex items-center justify-between text-[12.5px]">
                      <div>
                        <div className="font-semibold">{h.name}</div>
                        <div className="tabular-nums" style={{ color: C.ink45 }}>
                          {h.qty}주 · 산 값 {won(h.avg)}원
                        </div>
                      </div>
                      <div className="text-right tabular-nums" style={{ color: toneOf(pl) }}>
                        <div className="font-bold">{signed(pl, 0)}원</div>
                        <div className="text-[11px]">{signed(rate)}%</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className="st-focus mt-3 flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-[12.5px] font-medium"
                style={{ borderColor: C.line, color: C.brand }}
              >
                전체 보기 <ChevronRight size={13} />
              </button>
            </div>
          </aside>
        </div>

        {/* ── 하단 안내 ────────────────────────────── */}
        <section className="mt-8 rounded-xl border p-5" style={{ borderColor: C.line, background: C.card }}>
          <h2 className="st-display mb-3 text-[17px] font-bold">사기 전에 이것만은 확인하세요</h2>
          <ul className="grid gap-2.5 text-[13px] leading-relaxed sm:grid-cols-3" style={{ color: C.ink70 }}>
            <li className="flex gap-2">
              <span style={{ color: C.brand }}>·</span> 점수가 높아도 오른다는 뜻은 아니에요. <strong>왜 뽑혔는지</strong>를 먼저 읽어 보세요.
            </li>
            <li className="flex gap-2">
              <span style={{ color: C.brand }}>·</span> 한 종목에 몰아 담지 말고, 3~5개로 나누면 실수의 크기가 줄어요.
            </li>
            <li className="flex gap-2">
              <span style={{ color: C.brand }}>·</span> 거래가 갑자기 늘어난 종목은 <strong>뉴스부터</strong> 확인하는 습관을 들이세요.
            </li>
          </ul>
          <p className="mt-4 border-t pt-3 text-[11.5px] leading-relaxed" style={{ borderColor: C.line, color: C.ink45 }}>
            StockTracer가 보여주는 목록은 공개된 시세와 재무 데이터를 정해진 기준으로 정리한 결과이며, 특정 종목의 매수·매도를 권하는 것이 아닙니다.
            투자 판단과 그 결과는 투자자 본인에게 있습니다. 현재 화면의 값은 모두 샘플 데이터입니다.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ------------------------ 보조 컴포넌트 ------------------------ */

function Metric({
  easy,
  easyLabel,
  proLabel,
  hint,
  value,
  tone,
}: {
  easy: boolean;
  easyLabel: string;
  proLabel: string;
  hint: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center" style={{ color: C.ink70 }}>
        {easy ? easyLabel : proLabel}
        <TermHint label={`${easyLabel} (${proLabel})`} body={hint} />
      </dt>
      <dd className="font-bold tabular-nums" style={{ color: tone ?? C.ink }}>
        {value}
      </dd>
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: C.ink45 }}>{label}</span>
      <span className={strong ? "font-bold tabular-nums" : "tabular-nums"} style={{ color: tone ?? C.ink }}>
        {value}
      </span>
    </div>
  );
}
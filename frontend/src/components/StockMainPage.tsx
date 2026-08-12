// src/pages/MainPage.tsx
//
// Stock Tracer — 메인 대시보드
// -----------------------------------------------------------------------------
// 설치/설정 참고:
// 1) Pretendard 폰트를 쓰려면 index.html <head>에 아래 CDN을 추가하세요.
//    <link rel="stylesheet" as="style" crossorigin
//      href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
//    (없어도 시스템 폰트로 자연스럽게 폴백됩니다)
// 2) 이 파일은 커스텀 색상을 tailwind.config 확장 없이 arbitrary value(bg-[#...])로
//    바로 사용하도록 작성했습니다. 프로젝트 톤이 굳어지면 tailwind.config.ts의
//    theme.extend.colors 로 옮기는 걸 추천드려요.
// 3) 데이터는 전부 목업입니다. 실제 연동 시 아래 mock 배열들을 API 응답 타입으로
//    교체하고, useEffect/react-query 등으로 fetch 하시면 됩니다.
// -----------------------------------------------------------------------------

import { useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FlowStock {
  code: string;
  name: string;
  sector: string;
  consecutiveDays: number; // 연속 순매수 일수
  netBuyRatio: number; // 순매수대금 / 평균거래대금(20일) — 정규화된 강도, %
  priceChangePct: number; // 당일 등락률
  isProgramHeavy: boolean; // 차익거래(프로그램매매) 비중이 높아 신호가 흐려지는 경우
  buyerType: "foreign" | "institution" | "both";
}

interface ValueStock {
  code: string;
  name: string;
  sector: string;
  per: number;
  sectorAvgPer: number;
  pbr: number;
  roe: number;
  operatingMargin: number;
  debtRatio: number;
  profitTrendQuarters: number[]; // 최근 4개 분기 영업이익 (억원), 밸류트랩 감지용
}

// 보조 신호 리스트(8종)에 공통으로 쓰는 최소 단위.
// 각 신호마다 컬럼이 달라서 풀 테이블 대신 "이름 + 핵심 지표 1~2개 + 톤"으로 통일했습니다.
interface SignalRow {
  code: string;
  name: string;
  values: { label: string; value: string; tone?: "up" | "down" | "warn" | "neutral" }[];
  note?: string;
}

// ---------------------------------------------------------------------------
// Mock data — 실제 서비스 연동 전까지 화면 구조 확인용
// ---------------------------------------------------------------------------

const FLOW_STOCKS: FlowStock[] = [
  {
    code: "005930",
    name: "삼성전자",
    sector: "반도체",
    consecutiveDays: 8,
    netBuyRatio: 34.2,
    priceChangePct: 1.8,
    isProgramHeavy: false,
    buyerType: "both",
  },
  {
    code: "000660",
    name: "SK하이닉스",
    sector: "반도체",
    consecutiveDays: 6,
    netBuyRatio: 41.5,
    priceChangePct: 2.4,
    isProgramHeavy: false,
    buyerType: "foreign",
  },
  {
    code: "035420",
    name: "NAVER",
    sector: "인터넷",
    consecutiveDays: 5,
    netBuyRatio: 18.7,
    priceChangePct: 0.6,
    isProgramHeavy: true,
    buyerType: "institution",
  },
  {
    code: "051910",
    name: "LG화학",
    sector: "화학",
    consecutiveDays: 4,
    netBuyRatio: 22.9,
    priceChangePct: -0.4,
    isProgramHeavy: false,
    buyerType: "both",
  },
  {
    code: "006400",
    name: "삼성SDI",
    sector: "2차전지",
    consecutiveDays: 3,
    netBuyRatio: 15.1,
    priceChangePct: -1.1,
    isProgramHeavy: true,
    buyerType: "foreign",
  },
];

const VALUE_STOCKS: ValueStock[] = [
  {
    code: "005930",
    name: "삼성전자",
    sector: "반도체",
    per: 11.2,
    sectorAvgPer: 16.8,
    pbr: 1.1,
    roe: 14.3,
    operatingMargin: 18.9,
    debtRatio: 32.1,
    profitTrendQuarters: [8100, 9200, 9800, 10500],
  },
  {
    code: "010130",
    name: "고려아연",
    sector: "비철금속",
    per: 9.4,
    sectorAvgPer: 12.1,
    pbr: 0.9,
    roe: 11.7,
    operatingMargin: 9.2,
    debtRatio: 41.5,
    profitTrendQuarters: [1200, 1150, 1080, 1020],
  },
  {
    code: "030200",
    name: "KT",
    sector: "통신",
    per: 7.8,
    sectorAvgPer: 9.5,
    pbr: 0.7,
    roe: 9.1,
    operatingMargin: 11.4,
    debtRatio: 55.2,
    profitTrendQuarters: [3400, 3450, 3300, 3500],
  },
];

// --- 보조 신호 8종 목업 데이터 -----------------------------------------------
// 실연동 시: 각 배열을 해당 API 응답으로 교체하면 됩니다. code가 위 두 리스트와
// 겹치면 교집합 계산에도 자동으로 반영되도록 확장할 수 있어요.

const HIGH_LOW_ROWS: SignalRow[] = [
  {
    code: "042700",
    name: "한미반도체",
    values: [{ label: "52주 신고가", value: "-0.4%", tone: "up" }],
    note: "신고가 근접, 거래량 동반",
  },
  {
    code: "035720",
    name: "카카오",
    values: [{ label: "52주 신저가", value: "+1.1%", tone: "down" }],
    note: "신저가 근접, 반등 여부 확인 필요",
  },
];

const EARNINGS_SURPRISE_ROWS: SignalRow[] = [
  {
    code: "003670",
    name: "포스코퓨처엠",
    values: [{ label: "컨센서스 대비", value: "+18.2%", tone: "up" }],
    note: "영업이익 서프라이즈",
  },
  {
    code: "005380",
    name: "현대차",
    values: [{ label: "컨센서스 대비", value: "+6.5%", tone: "up" }],
  },
];

const VOLUME_SURGE_ROWS: SignalRow[] = [
  {
    code: "086520",
    name: "에코프로",
    values: [
      { label: "거래량", value: "320%", tone: "up" },
      { label: "등락률", value: "+4.2%", tone: "up" },
    ],
    note: "20일 평균 거래량 대비",
  },
  {
    code: "068270",
    name: "셀트리온",
    values: [
      { label: "거래량", value: "210%", tone: "up" },
      { label: "등락률", value: "+2.1%", tone: "up" },
    ],
  },
];

const SHORT_CREDIT_ROWS: SignalRow[] = [
  {
    code: "373220",
    name: "LG에너지솔루션",
    values: [{ label: "공매도잔고", value: "-1.8%p", tone: "up" }],
    note: "숏커버링 가능성",
  },
  {
    code: "377300",
    name: "카카오페이",
    values: [{ label: "신용잔고", value: "+2.3%p", tone: "warn" }],
    note: "신용 과열 경고",
  },
];

const BUYBACK_ROWS: SignalRow[] = [
  {
    code: "017670",
    name: "SK텔레콤",
    values: [{ label: "규모", value: "1,500억" }],
    note: "자사주 매입 공시",
  },
  {
    code: "086790",
    name: "하나금융지주",
    values: [{ label: "규모", value: "800억" }],
    note: "자사주 소각 결정",
  },
];

const INSIDER_BUY_ROWS: SignalRow[] = [
  {
    code: "271560",
    name: "오리온",
    values: [{ label: "매수자", value: "등기임원" }],
    note: "특별관계자 장내 매수 공시",
  },
];

const DIVIDEND_ROWS: SignalRow[] = [
  {
    code: "033780",
    name: "KT&G",
    values: [
      { label: "배당수익률", value: "5.1%" },
      { label: "연속증가", value: "5년" },
    ],
  },
  {
    code: "316140",
    name: "우리금융지주",
    values: [
      { label: "배당수익률", value: "6.2%" },
      { label: "연속증가", value: "3년" },
    ],
  },
];

const RISK_WARNING_ROWS: SignalRow[] = [
  {
    code: "000000",
    name: "예시종목A",
    values: [
      { label: "부채비율", value: "187%", tone: "warn" },
      { label: "이자보상배율", value: "0.8", tone: "warn" },
    ],
    note: "이자보상배율 1 미만 — 이자비용이 영업이익을 초과",
  },
];

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function ChangeTag({ value }: { value: number }) {
  const isUp = value > 0;
  const isFlat = value === 0;
  const color = isFlat ? "text-[#8B92A3]" : isUp ? "text-[#FF5C5C]" : "text-[#4C8DFF]";
  const sign = isUp ? "+" : "";
  return (
    <span className={`font-mono text-sm tabular-nums ${color}`}>
      {sign}
      {value.toFixed(2)}%
    </span>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F5C453]">
      <span className="h-1 w-1 rounded-full bg-[#F5C453]" />
      {children}
    </div>
  );
}

function toneColor(tone?: "up" | "down" | "warn" | "neutral") {
  switch (tone) {
    case "up":
      return "text-[#FF5C5C]";
    case "down":
      return "text-[#4C8DFF]";
    case "warn":
      return "text-[#F5C453]";
    default:
      return "text-[#C9CDD8]";
  }
}

// 보조 신호 8종에 공통으로 쓰는 컴팩트 리스트 카드.
// 핵심 두 리스트(수급/밸류)는 풀 테이블, 나머지는 이 카드로 — 정보 위계를 레이아웃으로 표현.
function SignalGroup({
  eyebrow,
  title,
  rows,
  warning = false,
}: {
  eyebrow: string;
  title: string;
  rows: SignalRow[];
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        warning ? "border-[#F5C453]/30 bg-[#F5C453]/[0.04]" : "border-[#232733] bg-[#12151C]/40"
      }`}
    >
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h3 className="mb-3 text-sm font-semibold text-[#E7E9EE]">{title}</h3>
      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.code} className="border-b border-[#1A1D26] pb-2.5 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{row.name}</div>
                <div className="font-mono text-[11px] text-[#565C6B]">{row.code}</div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {row.values.map((v) => (
                  <span key={v.label} className={`font-mono text-xs tabular-nums ${toneColor(v.tone)}`}>
                    {v.label} {v.value}
                  </span>
                ))}
              </div>
            </div>
            {row.note && <p className="mt-1 text-[11px] text-[#8B92A3]">{row.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// 밸류트랩 위험도를 간단 규칙으로 판정 (실제로는 서버에서 정교한 로직으로 계산 권장)
function getValueTrapWarning(stock: ValueStock): string | null {
  const [q1, q2, q3, q4] = stock.profitTrendQuarters;
  const isDeclining = q4 < q3 && q3 < q2;
  const highDebt = stock.debtRatio > 50;
  if (isDeclining && highDebt) return "영업이익 둔화 + 부채비율 과다 — 밸류트랩 가능성";
  if (isDeclining) return "최근 2개 분기 연속 영업이익 둔화";
  if (highDebt) return "부채비율 50% 초과, 재무 여력 확인 필요";
  return null;
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MainPage() {
  const [buyerFilter, setBuyerFilter] = useState<"all" | "foreign" | "institution">("all");

  const filteredFlow = useMemo(() => {
    if (buyerFilter === "all") return FLOW_STOCKS;
    return FLOW_STOCKS.filter((s) => s.buyerType === buyerFilter || s.buyerType === "both");
  }, [buyerFilter]);

  const intersectionCodes = useMemo(() => {
    const flowCodes = new Set(FLOW_STOCKS.map((s) => s.code));
    return VALUE_STOCKS.filter((v) => flowCodes.has(v.code));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0D12] font-sans text-[#E7E9EE] [font-family:'Pretendard',system-ui,sans-serif]">
      {/* Header */}
      <header className="border-b border-[#232733] bg-[#0B0D12]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold tracking-tight">
              Stock <span className="text-[#F5C453]">Tracer</span>
            </h1>
            <span className="hidden text-sm text-[#8B92A3] sm:inline">
              수급과 밸류에이션을 함께 읽는 스크리닝 대시보드
            </span>
          </div>
          <span className="rounded-full border border-[#232733] px-3 py-1 text-xs text-[#8B92A3]">
            {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}{" "}
            기준
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        {/* Disclaimer — 판단 보조 도구임을 명시 */}
        <div className="flex items-start gap-3 rounded-lg border border-[#F5C453]/25 bg-[#F5C453]/[0.06] px-4 py-3 text-sm text-[#C9CDD8]">
          <span className="mt-0.5 text-[#F5C453]">●</span>
          <p>
            아래 리스트는 매수 추천이 아니라 <strong className="text-[#E7E9EE]">판단을 보조하는 스크리닝 결과</strong>입니다.
            수급 신호는 후행적일 수 있고, 낮은 PER이 항상 저평가를 의미하지는 않습니다. 반드시 개별 종목의 재무 상세와
            업황을 함께 확인하세요.
          </p>
        </div>

        {/* Section: 교집합 하이라이트 */}
        {intersectionCodes.length > 0 && (
          <section>
            <SectionEyebrow>교집합 신호</SectionEyebrow>
            <h2 className="mb-3 text-lg font-semibold">
              수급 + 밸류 두 조건을 동시에 충족한 종목
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {intersectionCodes.map((stock) => {
                const flow = FLOW_STOCKS.find((f) => f.code === stock.code)!;
                return (
                  <div
                    key={stock.code}
                    className="rounded-lg border border-[#F5C453]/40 bg-gradient-to-br from-[#F5C453]/[0.08] to-transparent p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{stock.name}</span>
                      <span className="font-mono text-xs text-[#8B92A3]">{stock.code}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8B92A3]">
                      <span>연속매수 {flow.consecutiveDays}일</span>
                      <span>PER {stock.per} (업종 {stock.sectorAvgPer})</span>
                      <span>ROE {stock.roe}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section: 외국인/기관 연속 매수 */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <SectionEyebrow>수급 신호</SectionEyebrow>
              <h2 className="text-lg font-semibold">외국인·기관 연속 순매수</h2>
            </div>
            <div className="flex gap-1 rounded-md border border-[#232733] p-1 text-xs">
              {(["all", "foreign", "institution"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setBuyerFilter(key)}
                  className={`rounded px-2.5 py-1 transition-colors ${
                    buyerFilter === key
                      ? "bg-[#F5C453] text-[#0B0D12] font-semibold"
                      : "text-[#8B92A3] hover:text-[#E7E9EE]"
                  }`}
                >
                  {key === "all" ? "전체" : key === "foreign" ? "외국인" : "기관"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#232733]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#232733] bg-[#12151C] text-left text-xs text-[#8B92A3]">
                  <th className="px-4 py-3 font-medium">종목</th>
                  <th className="px-4 py-3 font-medium">섹터</th>
                  <th className="px-4 py-3 font-medium text-right">연속일수</th>
                  <th className="px-4 py-3 font-medium text-right">
                    순매수강도<span className="ml-1 text-[#565C6B]">(20일 평균 대비)</span>
                  </th>
                  <th className="px-4 py-3 font-medium text-right">등락률</th>
                  <th className="px-4 py-3 font-medium text-right">비고</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlow.map((stock, i) => (
                  <tr
                    key={stock.code}
                    className={`${i !== filteredFlow.length - 1 ? "border-b border-[#1A1D26]" : ""} hover:bg-[#12151C]/60`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{stock.name}</div>
                      <div className="font-mono text-xs text-[#565C6B]">{stock.code}</div>
                    </td>
                    <td className="px-4 py-3 text-[#8B92A3]">{stock.sector}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{stock.consecutiveDays}일</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {stock.netBuyRatio.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChangeTag value={stock.priceChangePct} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {stock.isProgramHeavy && (
                        <span className="rounded-full border border-[#565C6B] px-2 py-0.5 text-[11px] text-[#8B92A3]">
                          프로그램매매 비중↑
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: 저평가 우량주 */}
        <section>
          <SectionEyebrow>밸류에이션 신호</SectionEyebrow>
          <h2 className="mb-3 text-lg font-semibold">돈 잘 버는데 저평가된 기업</h2>

          <div className="overflow-hidden rounded-lg border border-[#232733]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#232733] bg-[#12151C] text-left text-xs text-[#8B92A3]">
                  <th className="px-4 py-3 font-medium">종목</th>
                  <th className="px-4 py-3 font-medium text-right">PER (업종평균)</th>
                  <th className="px-4 py-3 font-medium text-right">PBR</th>
                  <th className="px-4 py-3 font-medium text-right">ROE</th>
                  <th className="px-4 py-3 font-medium text-right">영업이익률</th>
                  <th className="px-4 py-3 font-medium text-right">부채비율</th>
                  <th className="px-4 py-3 font-medium">경고</th>
                </tr>
              </thead>
              <tbody>
                {VALUE_STOCKS.map((stock, i) => {
                  const warning = getValueTrapWarning(stock);
                  const isCheap = stock.per < stock.sectorAvgPer;
                  return (
                    <tr
                      key={stock.code}
                      className={`${i !== VALUE_STOCKS.length - 1 ? "border-b border-[#1A1D26]" : ""} hover:bg-[#12151C]/60`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{stock.name}</div>
                        <div className="font-mono text-xs text-[#565C6B]">{stock.code}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        <span className={isCheap ? "text-[#4C8DFF]" : ""}>{stock.per.toFixed(1)}</span>
                        <span className="ml-1 text-[#565C6B]">({stock.sectorAvgPer.toFixed(1)})</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{stock.pbr.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{stock.roe.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {stock.operatingMargin.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{stock.debtRatio.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        {warning ? (
                          <span className="text-xs text-[#F5C453]">⚠ {warning}</span>
                        ) : (
                          <span className="text-xs text-[#565C6B]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[#565C6B]">
            PER은 업종 평균 대비로, 경고는 최근 4개 분기 영업이익 추세와 부채비율 기준의 간단 규칙 판정입니다.
            실제 서비스에서는 서버 사이드에서 더 정교한 로직으로 계산하는 걸 권장해요.
          </p>
        </section>

        {/* Section: 보조 신호 8종 — 핵심 두 리스트를 보완하는 컴팩트 카드들 */}
        <section>
          <SectionEyebrow>보조 신호</SectionEyebrow>
          <h2 className="mb-1 text-lg font-semibold">함께 확인하면 좋은 스크리닝 지표</h2>
          <p className="mb-4 text-xs text-[#565C6B]">
            위 두 리스트만으로 판단하지 말고, 아래 신호와 겹치는지 교차 확인하는 걸 권장해요.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SignalGroup eyebrow="모멘텀" title="52주 신고가 · 신저가" rows={HIGH_LOW_ROWS} />
            <SignalGroup eyebrow="실적" title="컨센서스 서프라이즈" rows={EARNINGS_SURPRISE_ROWS} />
            <SignalGroup eyebrow="수급" title="거래량 급증 + 상승 동반" rows={VOLUME_SURGE_ROWS} />
            <SignalGroup eyebrow="수급 리스크" title="공매도 · 신용잔고 변화" rows={SHORT_CREDIT_ROWS} />
            <SignalGroup eyebrow="자본정책" title="자사주 매입 · 소각 공시" rows={BUYBACK_ROWS} />
            <SignalGroup eyebrow="내부자" title="임원 · 주요주주 매수 공시" rows={INSIDER_BUY_ROWS} />
            <SignalGroup eyebrow="인컴" title="배당수익률 + 배당성장" rows={DIVIDEND_ROWS} />
            <SignalGroup
              eyebrow="경고"
              title="재무 위험 — 피해야 할 종목"
              rows={RISK_WARNING_ROWS}
              warning
            />
          </div>
        </section>
      </main>
    </div>
  );
}
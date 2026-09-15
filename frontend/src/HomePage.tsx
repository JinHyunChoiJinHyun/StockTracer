import { useEffect, useMemo, useState } from "react";

/* ==================================================================
 * 타입
 * ================================================================== */

export type TagType = "POSITIVE" | "CAUTION" | "NEUTRAL";

export type Market = "KOSPI" | "KOSDAQ";

export interface StockTag {
  code: string;
  label: string;
  type: TagType;
}

export interface MainStock {
  stockCode: string;
  stockName: string;
  market: Market;
  sector: string;
  baseDate: string; // YYYY-MM-DD

  closePrice: number;
  priceChange: number;
  changeRate: number;

  /** 0~100. 화면에는 막대로만 표현하고 숫자는 노출하지 않습니다. */
  valueScore: number;

  /** null = 판단 보류. false 로 치환하면 안 됩니다. */
  valueTrapFlag: boolean | null;

  divYield: number;
  firstDetectedDate: string;
  tags: StockTag[];

  /** 최근 20거래일 종가. 목록 응답이 무거우면 별도 엔드포인트로 분리하세요. */
  priceTrend: number[];
}

/** 백엔드 ApiResponse 봉투 */
interface ApiResult<T> {
  success: boolean;
  stocks: T | null;
  errorCode: string | null;
  message: string | null;
}

export const MARKET_LABEL: Record<Market, string> = {
  KOSPI: "코스피",
  KOSDAQ: "코스닥",
};

/* ==================================================================
 * API 연동
 * ================================================================== */

const API_BASE = "http://localhost:8080";

/** 상태 코드별로 사용자에게 보여줄 문구를 정합니다. */
function messageForStatus(status: number): string {
  if (status === 404) return "요청한 종목을 찾을 수 없습니다.";
  if (status === 400) return "요청 조건이 올바르지 않습니다.";
  if (status >= 500) return "서버에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
  return "데이터를 불러오지 못했습니다.";
}

/** GET /api/v1/main/stocks */
async function fetchMainStocks(): Promise<MainStock[]> {
  const response = await fetch(`${API_BASE}/api/v1/main/stocks`);

  if (!response.ok) throw new Error(messageForStatus(response.status));

  const result = (await response.json()) as ApiResult<MainStock[]>;
  console.log(result.stocks);

  if (result.stocks === null) {
    throw new Error(result.message ?? "데이터를 불러오지 못했습니다.");
  }
  return result.stocks;
}

/* ---------------------------- 조회 훅 ---------------------------- */

/** 메인 목록. reload 로 수동 재시도할 수 있습니다. */
function useMainStocks() {
  const [stocks, setStocks] = useState<MainStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchMainStocks()
      .then((data) => setStocks(data))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.");
        setStocks([]);
      })
      .finally(() => setLoading(false));
  }, [nonce]);

  return { stocks, loading, error, reload: () => setNonce((n) => n + 1) };
}

/* ==================================================================
 * 화면
 * ================================================================== */

/* ---------------------------- 포맷터 ---------------------------- */

const nf = new Intl.NumberFormat("ko-KR");

const fmtPrice = (v: number): string => nf.format(v);

const signed = (v: number, digits = 2, suffix = ""): string =>
  `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(digits)}${suffix}`;

/* 한국 시장 관례: 상승 빨강, 하락 파랑 */
type Direction = "up" | "down" | "flat";
const dir = (v: number): Direction => (v > 0 ? "up" : v < 0 ? "down" : "flat");

/** 기준일로부터 7일 이내에 목록에 들어온 종목 */
const isNew = (
  r: Pick<MainStock, "firstDetectedDate">,
  baseDate: string
): boolean =>
  (new Date(baseDate).getTime() - new Date(r.firstDetectedDate).getTime()) /
    86_400_000 <=
  7;

/** "2026-09-11" → "9월 11일" */
function formatKoreanDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

/* ---------------------------- 판정 ---------------------------- */

type VerdictTone = "good" | "caution" | "unknown" | "plain";

interface Verdict {
  text: string;
  tone: VerdictTone;
}

/** 사라/팔아라가 아니라 "지금 어떤 상태인가"를 말합니다. */
function verdictOf(r: Pick<MainStock, "valueTrapFlag" | "valueScore">): Verdict {
  if (r.valueTrapFlag === true)
    return { text: "싸 보이지만 이유를 확인하세요", tone: "caution" };
  if (r.valueTrapFlag === null)
    return { text: "아직 판단하지 않았어요", tone: "unknown" };
  if (r.valueScore >= 85) return { text: "많이 싼 편이에요", tone: "good" };
  if (r.valueScore >= 72) return { text: "싼 편이에요", tone: "good" };
  return { text: "보통 수준이에요", tone: "plain" };
}

type PresetKey = "valueScore" | "divYield";

interface Preset {
  key: PresetKey;
  label: string;
}

const PRESETS: Preset[] = [
  { key: "valueScore", label: "저평가 순" },
  { key: "divYield", label: "배당 많은 순" },
];

/* ---------------------------- 조각 ---------------------------- */

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

function Sparkline({ data, width = 64, height = 20 }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 3) - 1.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const rising = data[data.length - 1] >= data[0];

  return (
    <svg
      className="spark"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <polyline points={points} className={rising ? "s-up" : "s-down"} />
    </svg>
  );
}

function TagChip({ tag }: { tag: StockTag }) {
  return <span className={`tag t-${tag.type.toLowerCase()}`}>{tag.label}</span>;
}

function Meter({ value, tone }: { value: number; tone: VerdictTone }) {
  return (
    <div className="meter" aria-hidden="true">
      <span className={`meter-fill m-${tone}`} style={{ width: `${value}%` }} />
    </div>
  );
}

/* ---------------------------- 종목 카드 ---------------------------- */

interface StockCardProps {
  stock: MainStock;
  onOpen: (stock: MainStock) => void;
}

function StockCard({ stock, onOpen }: StockCardProps) {
  const verdict = verdictOf(stock);

  return (
    <button type="button" className={`card c-${verdict.tone}`} onClick={() => onOpen(stock)}>
      <div className="card-top">
        <div className="who">
          <span className="who-name">{stock.stockName}</span>
          {isNew(stock, stock.baseDate) && <span className="new">새로 들어옴</span>}
          <span className="who-sub">
            {MARKET_LABEL[stock.market]} · {stock.sector}
          </span>
        </div>
        <div className="price">
          <span className="p-num">{fmtPrice(stock.closePrice)}원</span>
          <span className={`p-chg ${dir(stock.changeRate)}`}>
            {signed(stock.changeRate, 2, "%")}
          </span>
          <Sparkline data={stock.priceTrend} />
        </div>
      </div>

      <div className="card-mid">
        <span className={`verdict vd-${verdict.tone}`}>{verdict.text}</span>
        <Meter value={stock.valueScore} tone={verdict.tone} />
      </div>

      <div className="card-bot">
        <span className="div-chip">
          {stock.divYield > 0 ? `배당 ${stock.divYield.toFixed(1)}%` : "배당 없음"}
        </span>
        <div className="tag-line">
          {stock.tags.slice(0, 2).map((t) => (
            <TagChip key={t.code} tag={t} />
          ))}
          {stock.tags.length > 2 && (
            <span className="tag t-more">+{stock.tags.length - 2}</span>
          )}
        </div>
        <span className="more">자세히 보기</span>
      </div>
    </button>
  );
}

/* ---------------------------- 메인 ---------------------------- */

function ListSkeleton() {
  return (
    <ul className="list" role="status" aria-label="목록 불러오는 중">
      {[0, 1, 2, 3].map((i) => (
        <li key={i}>
          <div className="card card-sk">
            <span className="sk sk-title" />
            <span className="sk sk-bar" />
            <span className="sk sk-chips" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function MainPage() {
  const { stocks, loading, error, reload } = useMainStocks();

  const [preset, setPreset] = useState<PresetKey>("valueScore");
  const [hideRisky, setHideRisky] = useState(true);
  const [selected, setSelected] = useState<MainStock | null>(null);

  const view = useMemo(() => {
    return stocks
      .filter((s) => !hideRisky || s.valueTrapFlag !== true)
      .sort((a, b) => b[preset] - a[preset]);
  }, [stocks, preset, hideRisky]);

  // 지금은 응답이 전체 목록이라 화면에서 세도 맞습니다.
  // 페이지네이션이 붙으면 서버가 summary 로 내려줘야 합니다. 현재 페이지만 세게 되니까요.
  const baseDate = stocks[0]?.baseDate ?? null;
  const total = stocks.length;
  const trapCount = stocks.filter((s) => s.valueTrapFlag === true).length;

  return (
    <div className="page">
      <style>{CSS}</style>

      <header className="head">
        <h1>지금 싼 종목</h1>
        {baseDate ? (
          <p className="lead">
            {formatKoreanDate(baseDate)} 종가 기준으로 <b>{total}개</b> 종목이 저평가 조건을
            통과했어요. 이 중 <b className="warn">{trapCount}개</b>는 싸 보이지만 이익이 줄고
            있어 확인이 필요합니다.
          </p>
        ) : (
          <p className="lead lead-dim">
            {loading ? "오늘의 저평가 종목을 불러오고 있어요." : " "}
          </p>
        )}
      </header>

      {stocks.length > 0 && (
        <div className="controls">
          <div className="seg" role="group" aria-label="정렬 기준">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={preset === p.key ? "on" : ""}
                onClick={() => setPreset(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={hideRisky}
              onChange={(e) => setHideRisky(e.target.checked)}
            />
            확인이 필요한 종목 숨기기
          </label>
        </div>
      )}

      {error !== null ? (
        <div className="err-wrap">
          <div className="errbox" role="alert">
            <p>{error}</p>
            <button type="button" className="linkbtn" onClick={reload}>
              다시 시도
            </button>
          </div>
        </div>
      ) : loading ? (
        <ListSkeleton />
      ) : view.length > 0 ? (
        <ul className="list">
          {view.map((s) => (
            <li key={s.stockCode}>
              <StockCard stock={s} onOpen={setSelected} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <p>조건에 맞는 종목이 없어요.</p>
          {hideRisky && stocks.length > 0 && (
            <button type="button" className="linkbtn" onClick={() => setHideRisky(false)}>
              숨긴 종목까지 보기
            </button>
          )}
        </div>
      )}

      {baseDate && (
        <footer className="foot">
          여기 나온 숫자는 {formatKoreanDate(baseDate)} 종가까지 공시된 자료만 사용합니다.
          투자 판단과 책임은 본인에게 있습니다.
        </footer>
      )}

      {/* 상세 패널은 /api/v1/stocks/{stockCode} 붙으면 여기에.
          selected 는 그때까지 자리만 지킵니다.
      <DetailPanel
        stockCode={selected?.stockCode ?? null}
        baseDate={selected?.baseDate ?? null}
        fallbackName={selected?.stockName ?? ""}
        onClose={() => setSelected(null)}
      /> */}
    </div>
  );
}

/* ---------------------------- 스타일 ---------------------------- */

const CSS = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css');

.page {
  --ink: #16202b;
  --ink-2: #55646f;
  --ink-3: #8b97a1;
  --line: #e2e7eb;
  --line-2: #eef1f4;
  --paper: #f1f3f5;
  --surface: #ffffff;
  --up: #d6173a;
  --down: #1b64da;
  --good: #157a63;
  --caution: #a8620f;
  --plain: #7b8894;

  font-family: Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo',
    'Malgun Gothic', system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  background: var(--paper);
  color: var(--ink);
  min-height: 100%;
  padding: 32px 20px 64px;
  -webkit-font-smoothing: antialiased;
}
.page *, .page *::before, .page *::after { box-sizing: border-box; }
.page button { font: inherit; cursor: pointer; }
.page :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.head { max-width: 760px; margin: 0 auto 20px; }
.head h1 { margin: 0; font-size: 27px; font-weight: 700; letter-spacing: -0.03em; }
.lead { margin: 10px 0 0; font-size: 15px; line-height: 1.65; color: var(--ink-2); max-width: 46ch; }
.lead b { color: var(--ink); font-weight: 600; }
.lead b.warn { color: var(--caution); }

.controls {
  max-width: 760px; margin: 0 auto 14px;
  display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
}
.seg { display: inline-flex; background: var(--surface); border: 1px solid var(--line); border-radius: 9px; overflow: hidden; }
.seg button { border: 0; background: transparent; padding: 9px 15px; font-size: 14px; color: var(--ink-2); }
.seg button + button { border-left: 1px solid var(--line); }
.seg button.on { background: var(--ink); color: #fff; font-weight: 600; }
.check { display: inline-flex; align-items: center; gap: 7px; font-size: 14px; color: var(--ink-2); cursor: pointer; }
.check input { width: 16px; height: 16px; accent-color: var(--caution); }

.list { max-width: 760px; margin: 0 auto; padding: 0; list-style: none; display: grid; gap: 10px; }

.card {
  display: block; width: 100%; text-align: left;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 14px; padding: 18px 20px 16px;
}
.card:hover { border-color: #c9d2d9; }
.c-caution { border-left: 4px solid #d8a86a; }
.c-unknown { border-left: 4px solid var(--line); }

.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.who { display: flex; flex-wrap: wrap; align-items: baseline; gap: 7px; min-width: 0; }
.who-name { font-size: 19px; font-weight: 700; letter-spacing: -0.02em; }
.who-sub { font-size: 12.5px; color: var(--ink-3); }
.new {
  font-size: 11px; font-weight: 600; color: var(--good);
  border: 1px solid #b9d8d0; background: #f0f7f5; border-radius: 5px; padding: 2px 6px;
}
.price { display: flex; align-items: center; gap: 9px; white-space: nowrap; }
.p-num { font-size: 16px; font-weight: 600; }
.p-chg { font-size: 14px; font-weight: 600; }
.p-chg.up { color: var(--up); }
.p-chg.down { color: var(--down); }
.p-chg.flat { color: var(--ink-3); }
.spark polyline { fill: none; stroke-width: 1.5; }
.s-up { stroke: var(--up); }
.s-down { stroke: var(--down); }

.card-mid { margin-top: 15px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.verdict { font-size: 15.5px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
.vd-good { color: var(--good); }
.vd-caution { color: var(--caution); }
.vd-unknown { color: var(--ink-3); }
.vd-plain { color: var(--ink-2); }

.meter { flex: 1 1 180px; min-width: 140px; height: 6px; border-radius: 3px; background: var(--line-2); overflow: hidden; }
.meter-fill { display: block; height: 100%; border-radius: 3px; }
.m-good { background: var(--good); }
.m-caution { background: #c98b3c; }
.m-unknown { background: #c3ccd3; }
.m-plain { background: var(--plain); }

.card-bot {
  margin-top: 15px; padding-top: 13px; border-top: 1px solid var(--line-2);
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.div-chip { font-size: 13px; font-weight: 600; color: var(--ink-2); }
.tag-line { display: flex; flex-wrap: wrap; gap: 5px; }
.tag {
  display: inline-flex; align-items: center; border-radius: 6px;
  padding: 3px 9px; font-size: 12px; line-height: 1.55; white-space: nowrap; border: 1px solid;
}
.t-positive { color: var(--good); border-color: #b9d8d0; background: #f0f7f5; }
.t-caution { color: var(--caution); border-color: #e3cbad; background: #fbf5ed; }
.t-neutral { color: var(--ink-2); border-color: var(--line); background: var(--surface); }
.t-more { color: var(--ink-3); border-color: transparent; padding: 3px 2px; }
.more { margin-left: auto; font-size: 12.5px; color: var(--ink-3); }

.lead-dim { color: var(--ink-3); min-height: 1.65em; }

.card-sk { display: grid; gap: 14px; pointer-events: none; }
.sk { display: block; border-radius: 8px; background: var(--line-2); }
.sk-title { height: 22px; width: 45%; }
.sk-bar { height: 16px; width: 100%; }
.sk-chips { height: 20px; width: 62%; }

.err-wrap { max-width: 760px; margin: 0 auto; }
.errbox {
  margin-top: 18px; padding: 20px; border-radius: 12px;
  border: 1px solid #e3cbad; background: #fbf5ed; text-align: center;
}
.errbox p { margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: var(--caution); }

.empty { max-width: 760px; margin: 0 auto; padding: 48px 20px; text-align: center; color: var(--ink-2); }
.empty p { margin: 0 0 10px; font-size: 15px; }
.linkbtn { border: 0; background: transparent; color: var(--ink); font-size: 14px; text-decoration: underline; text-underline-offset: 4px; }

.foot { max-width: 760px; margin: 22px auto 0; font-size: 12px; line-height: 1.7; color: var(--ink-3); }

@media (max-width: 560px) {
  .page { padding: 22px 14px 48px; }
  .head h1 { font-size: 23px; }
  .card { padding: 16px 16px 14px; }
  .card-top { flex-direction: column; gap: 8px; }
  .price { align-self: stretch; }
  .p-num { font-size: 18px; }
  .spark { margin-left: auto; }
}
`;
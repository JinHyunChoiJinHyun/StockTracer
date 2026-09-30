import { useLocation, useNavigate, useParams } from "react-router-dom";
import ScoreBar from "../components/ScoreBar";
import StockTagLabel from "../components/StockTag";
import { ChangeRate, JudgmentBadge } from "../components/StockCard";
import { useStockDetail } from "../hooks/useStocks";
import { NotFoundError } from "../api/stockApi";
import { TAG_DESCRIPTIONS, clampScore, formatDividend, formatPrice } from "../utils/stock";

export default function StockDetailPage() {
  const { stockCode = "" } = useParams<{ stockCode: string }>();
  const { state, reload } = useStockDetail(stockCode);
  const navigate = useNavigate();
  const location = useLocation();

  // 목록에서 들어왔으면 history 뒤로(필터·스크롤 유지), 주소로 바로 들어왔으면 메인으로
  const goToList = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  };

  return (
    <main className="container detail">
      <button type="button" className="back-button" onClick={goToList}>
        ← 종목 목록
      </button>

      {state.status === "loading" && <div className="card card--skeleton detail__skeleton" />}

      {state.status === "error" && (
        <div className="state-box">
          <p className="state-box__title">
            {state.error instanceof NotFoundError
              ? `종목코드 ${stockCode}에 해당하는 종목이 없습니다`
              : "종목 정보를 불러오지 못했습니다"}
          </p>
          <p className="state-box__desc">
            {state.error instanceof NotFoundError
              ? "종목 목록에서 다시 선택해 주세요."
              : state.error.message}
          </p>
          {!(state.error instanceof NotFoundError) && (
            <button type="button" className="outline-button" onClick={reload}>
              다시 불러오기
            </button>
          )}
        </div>
      )}

      {state.status === "success" && (
        <article className="card detail__card">
          <header className="detail__head">
            <div>
              <h1 className="detail__name">{state.data.stockName}</h1>
              <p className="card__sub">
                <span className="detail__code">{state.data.stockCode}</span>
                <span className="market">{state.data.market}</span>
                {state.data.sector}
              </p>
            </div>
            <div className="detail__total">
              <JudgmentBadge stock={state.data} />
              <span className="total-score total-score--lg">
                <small>종합점수</small>
                <strong>{clampScore(state.data.totalScore)}</strong>
              </span>
            </div>
          </header>

          <p className="card__price detail__price">
            {formatPrice(state.data.price)}
            <ChangeRate rate={state.data.changeRate} />
          </p>

          <div className="tags">
            {state.data.tags.length === 0 ? (
              <span className="tag tag--none">해당 태그 없음</span>
            ) : (
              state.data.tags.map((tag) => <StockTagLabel key={tag} tag={tag} />)
            )}
          </div>

          <dl className="detail__metrics">
            <div className="detail__metric">
              <dt>수급 점수</dt>
              <dd><ScoreBar label="수급" score={state.data.flowScore} /></dd>
            </div>
            <div className="detail__metric">
              <dt>저평가 점수</dt>
              <dd><ScoreBar label="저평가" score={state.data.valueScore} /></dd>
            </div>
            <div className="detail__metric">
              <dt>배당률</dt>
              <dd className="detail__dividend">{formatDividend(state.data.dividendYield)}</dd>
            </div>
          </dl>

          <section className="reasons" aria-labelledby="reasons-title">
            <h2 id="reasons-title" className="reasons__title">분석 근거</h2>
            {state.data.tagReasons.length === 0 ? (
              <p className="reasons__empty">
                적용된 태그가 없습니다. 수급·저평가 점수를 중심으로 확인하세요.
              </p>
            ) : (
              <ul className="reasons__list">
                {state.data.tagReasons.map(({ tag, reason }) => (
                  <li key={tag} className="reasons__item">
                    <StockTagLabel tag={tag} />
                    <div>
                      <p className="reasons__reason">{reason}</p>
                      {reason !== TAG_DESCRIPTIONS[tag] && (
                        <p className="reasons__rule">{TAG_DESCRIPTIONS[tag]}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="detail__meta">
            기준일 {state.data.baseDate} / 투자 판단의 책임은 본인에게 있습니다.
          </p>
        </article>
      )}
    </main>
  );
}

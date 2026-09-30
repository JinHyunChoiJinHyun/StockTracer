import { JUDGMENT_GUIDE } from "../utils/stock";

interface HeaderProps {
  /** 분석 기준일. 로딩 중이면 null */
  baseDate: string | null;
}

export default function Header({ baseDate }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <h1 className="header__title">StockTracer</h1>
        <p className="header__desc">
          수급과 저평가 지표를 함께 보고, 지금 관심을 둘 만한 종목을 먼저 보여줍니다.
        </p>

        <ul className="legend" aria-label="투자 판단 기준">
          {JUDGMENT_GUIDE.map(({ judgment, description }) => (
            <li key={judgment} className="legend__item">
              <span className={`dot dot--${judgment.replace(" ", "")}`} aria-hidden="true" />
              <strong>{judgment}</strong>
              <span className="legend__desc">{description}</span>
            </li>
          ))}
        </ul>

        <p className="header__meta">
          기준일 {baseDate ?? "불러오는 중"} / 투자 판단의 책임은 본인에게 있습니다.
        </p>
      </div>
    </header>
  );
}

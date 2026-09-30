import { clampScore, getScoreLevel } from "../utils/stock";

const SEGMENTS = 10;

interface ScoreBarProps {
  label: string;
  score: number;
}

export default function ScoreBar({ label, score }: ScoreBarProps) {
  const value = clampScore(score);
  const filled = Math.round(value / (100 / SEGMENTS));

  return (
    <div className="score-bar">
      <span className="score-bar__label">{label}</span>
      <div
        className="score-bar__track"
        role="meter"
        aria-label={`${label} 점수`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={`score-bar__seg${i < filled ? " is-filled" : ""}`} />
        ))}
      </div>
      <span className="score-bar__value">
        <strong>{value}</strong> {getScoreLevel(value)}
      </span>
    </div>
  );
}

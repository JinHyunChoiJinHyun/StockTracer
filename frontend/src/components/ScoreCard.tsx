// 상세 페이지 "핵심 지표"의 작은 카드 하나
// label: 지표 이름 (예: "PER")
// value: 화면에 보여줄 문자열 (예: "7.90배")

interface ScoreCardProps {
  label: string;
  value: string;
}

function ScoreCard({ label, value }: ScoreCardProps) {
  return (
    <div className="score-card">
      <div className="score-card-label">{label}</div>
      <div className="score-card-value">{value}</div>
    </div>
  );
}

export default ScoreCard;

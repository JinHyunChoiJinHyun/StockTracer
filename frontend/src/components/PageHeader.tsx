/**
 * 페이지 맨 위 영역입니다.
 * 초보자가 등급의 뜻을 바로 알 수 있도록 범례(매수 관심 / 관심 / 중립 / 주의)를 함께 보여줍니다.
 */

const GRADE_LEGEND = [
  { label: '매수 관심', color: 'bg-red-500', description: '지표가 전반적으로 좋음' },
  { label: '관심', color: 'bg-amber-500', description: '일부 지표가 좋음' },
  { label: '중립', color: 'bg-slate-400', description: '특별한 신호 없음' },
  { label: '주의', color: 'bg-blue-500', description: '지표가 좋지 않음' },
];

export default function PageHeader({ baseDate }: { baseDate: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="text-xl font-bold text-slate-900">오늘의 종목 판단</h1>
        <p className="mt-1 text-sm text-slate-500">
          수급과 저평가 지표를 함께 보고, 지금 관심을 둘 만한 종목을 먼저 보여줍니다.
        </p>

        <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {GRADE_LEGEND.map((legend) => (
            <div key={legend.label} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${legend.color}`} />
              <dt className="text-xs font-medium text-slate-700">{legend.label}</dt>
              <dd className="text-xs text-slate-400">{legend.description}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs text-slate-400">기준일 {baseDate} · 투자 판단의 책임은 본인에게 있습니다.</p>
      </div>
    </header>
  );
}
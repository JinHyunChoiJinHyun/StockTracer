import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import type { PriceHistory, FlowHistory } from "../types/stock";
import { formatShortDate } from "../utils/format";

// ===============================================
// 라인 그래프 (recharts 사용)
// ===============================================
// 종가 그래프와 수급 그래프 둘 다 이 컴포넌트 하나로 그린다.
//
// 사용 예 (종가):
//   <StockChart
//     data={priceHistory}
//     lines={[{ dataKey: "close", name: "종가", color: "#1f2937" }]}
//     formatValue={formatPrice}
//   />
//
// data 배열의 각 항목에서
//   - "date" 필드 → x축
//   - lines[].dataKey 필드 → 선 하나씩
// 으로 사용된다.
// ===============================================

// 그래프에 그릴 선 하나의 설정
export interface ChartLine {
  dataKey: string; // data 항목에서 읽을 필드 이름 (예: "close", "institution")
  name: string; // legend / tooltip에 보일 이름 (예: "종가", "기관")
  color: string; // 선 색
}

interface StockChartProps {
  data: (PriceHistory | FlowHistory)[]; // 종가 배열 또는 수급 배열
  lines: ChartLine[];
  formatValue: (value: number) => string; // tooltip / y축 숫자 표시 방법
  showZeroLine?: boolean; // true면 y=0 기준선을 그림 (순매수/순매도 구분용)
}

function StockChart({ data, lines, formatValue, showZeroLine = false }: StockChartProps) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#eceef1" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#d9dde3" }}
            minTickGap={16}
          />

          <YAxis
            // "auto"로 두면 0부터 시작하지 않고 데이터 범위에 맞춰짐
            domain={["auto", "auto"]}
            tickFormatter={(value) => formatValue(Number(value))}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            width={84}
          />

          <Tooltip
            labelFormatter={(label) => String(label)}
            formatter={(value) => formatValue(Number(value))}
            itemSorter={() => 0} // 이름순 자동 정렬을 끄고 lines 배열 순서대로 표시
          />

          <Legend
            iconType="plainline"
            wrapperStyle={{ fontSize: 13 }}
            itemSorter={null} // 이름순 자동 정렬을 끄고 lines 배열 순서대로 표시
          />

          {showZeroLine && <ReferenceLine y={0} stroke="#9ca3af" />}

          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="linear"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;

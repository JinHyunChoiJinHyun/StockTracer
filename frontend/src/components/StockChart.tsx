import React, {useEffect, useRef} from "react";
import { ColorType, createChart, type IChartApi, type CandlestickData, type Time, CandlestickSeries } from "lightweight-charts";

// TypeScript 타입 정의: 주식 캔들스틱 데이터 구조
export interface StockCandle{
    time: Time;    // 날짜
    open: number;  // 시가
    high: number;  // 고가
    low: number;   // 저가
    close: number; // 종가
}

interface StockChartProps{
    data: StockCandle[];
}

export const StockChart: React.FC<StockChartProps> = ({data}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. 차트 기본 캔버스 생성 및 스타일 설정
        // null 체크: null이면 아래 코드 실행없이 종료
        if(!chartContainerRef.current) return;

        // null이 아니면 실행
        const container = chartContainerRef.current;

        const chart: IChartApi = createChart(container, {
            layout: {
                background: {type: ColorType.Solid, color: "1E1E2E"},
                textColor: "#CDD6F4"
            },
            width: chartContainerRef.current?.clientWidth,
            height: 400,
            grid: {
                vertLines: {color:"#313244"},
                horzLines: {color:"#313244"},
            },
        });

        // 2. 캔들스틱 시리즈 추가
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#F38BA8",
            downColor: "#89B4FA",
            borderVisible: false,
            wickUpColor: "#F38BA8",
            wickDownColor: "#89B4FA",
        })

        // 3. 데이터 입력
        candlestickSeries.setData(data);
        
        // 4. 화면 크기 변경 대응 (반응형)
        const handleResize = () => {
            if(chartContainerRef.current){
                if(chartContainerRef.current){
                    chart.applyOptions({width: chartContainerRef.current.clientWidth});
                }
            }
        };
        // 컴포넌트 unmount시 정리 ??
        return () => {
            window.addEventListener("resize", handleResize);
            chart.remove();
        };
    }, [data]);

        
    return(
        <div style={{width: "100%", maxWidth:"900px", margin: "0 auto"}}>
            <div ref={chartContainerRef} style={{borderRadius: "12px", overflow: "hidden"}}/>
        </div>
    );
};
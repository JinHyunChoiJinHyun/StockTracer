import React from "react";

// 분석 데이터 타입 정의
export interface PriceChangeReason {
    id: string;
    stockName: string;
    stockCode: string;
    currentPrice: number;
    changeRate: number; // 변동률 (%)
    analysisDate: string;
    summary: string; // 한 줄 핵심 원인 요약
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; // 호재 / 악재
    drivers: {
        category: string; // 예: 실적 발표, 공시, 뉴스, 수급
        title: string;
        description: string;
        impactScore: number; // 영향도 (1~5)
    }[];
    relatedNews: {
        title: string;
        publisher: string;
        time: string;
        url: string;
    }[];
}

interface Props {
    data: PriceChangeReason;
}

export const StockAnalysis: React.FC<Props> = ({data}) => {
    const isUp = data.changeRate > 0;

    return(
        <div style={styles.container}>
        {/* 1. 상단 종목 헤더 및 변동률 */}
        <div style={styles.header}>
            <div>
            <h2 style={styles.stockTitle}>
                {data.stockName} <span style={styles.stockCode}>{data.stockCode}</span>
            </h2>
            <span style={styles.date}>{data.analysisDate} 기준 분석</span>
            </div>
            <div style={{ textAlign: 'right' }}>
            <div style={styles.price}>{data.currentPrice.toLocaleString()}원</div>
            <div style={{ ...styles.badge, backgroundColor: isUp ? '#F38BA8' : '#89B4FA' }}>
                {isUp ? '▲' : '▼'} {Math.abs(data.changeRate)}% {isUp ? '상승' : '하락'}
            </div>
            </div>
        </div>

        {/* 2. 핵심 변동 원인 요약 (AI / 분석 리포트 메인 영역) */}
        <div style={styles.summaryBox}>
            <h3 style={styles.sectionTitle}>💡 왜 {isUp ? '올랐' : '떨어졌'}을까요? (핵심 요약)</h3>
            <p style={styles.summaryText}>{data.summary}</p>
        </div>

        {/* 3. 세부 원인 분석 리스트 */}
        <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🔍 주요 변동 요인 (Impact Analysis)</h3>
            <div style={styles.driverGrid}>
            {data.drivers.map((driver, index) => (
                <div key={index} style={styles.driverCard}>
                <div style={styles.categoryTag}>{driver.category}</div>
                <h4 style={styles.driverTitle}>{driver.title}</h4>
                <p style={styles.driverDesc}>{driver.description}</p>
                <div style={styles.impactRating}>
                    영향도: {'★'.repeat(driver.impactScore)}{'☆'.repeat(5 - driver.impactScore)}
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* 4. 원인이 된 관련 핵심 뉴스 */}
        <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📰 원인 제공 핵심 뉴스 / 공시</h3>
            <div style={styles.newsList}>
            {data.relatedNews.map((news, index) => (
                <a key={index} href={news.url} style={styles.newsItem} target="_blank" rel="noreferrer">
                <div>
                    <div style={styles.newsTitle}>{news.title}</div>
                    <div style={styles.newsMeta}>{news.publisher} • {news.time}</div>
                </div>
                <span style={styles.arrow}>→</span>
                </a>
            ))}
            </div>
        </div>
        </div>
    );
};

// 다크 모드 기반 인라인 스타일
const styles: {[key: string]: React.CSSProperties} = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#1E1E2E',
        borderRadius: '16px',
        padding: '24px',
        color: '#CDD6F4',
        textAlign: 'left',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #313244',
        paddingBottom: '16px',
    },
    stockTitle: { margin: 0, fontSize: '24px', color: '#C3E88D' },
    stockCode: { fontSize: '14px', color: '#A6ADC8', fontWeight: 'normal' },
    date: { fontSize: '12px', color: '#6C7086' },
    price: { fontSize: '22px', fontWeight: 'bold' },
    badge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        color: '#11111B',
        fontWeight: 'bold',
        fontSize: '14px',
        marginTop: '4px',
    },
    summaryBox: {
        backgroundColor: '#181825',
        borderRadius: '12px',
        padding: '20px',
        margin: '20px 0',
        borderLeft: '4px solid #FAB387',
    },
    sectionTitle: { fontSize: '18px', margin: '0 0 12px 0', color: '#F9E2AF' },
    summaryText: { margin: 0, fontSize: '15px', lineHeight: '1.6', color: '#BAC2DE' },
    section: { marginTop: '24px' },
    driverGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    driverCard: {
        backgroundColor: '#313244',
        padding: '16px',
        borderRadius: '12px',
    },
    categoryTag: {
        display: 'inline-block',
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: '6px',
        backgroundColor: '#45475A',
        color: '#89B4FA',
        marginBottom: '8px',
    },
    driverTitle: { margin: '0 0 6px 0', fontSize: '15px', color: '#FFF' },
    driverDesc: { margin: '0 0 10px 0', fontSize: '13px', color: '#A6ADC8', lineHeight: '1.4' },
    impactRating: { fontSize: '12px', color: '#F9E2AF' },
    newsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    newsItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#181825',
        padding: '14px',
        borderRadius: '10px',
        textDecoration: 'none',
        color: 'inherit',
    },
    newsTitle: { fontSize: '14px', fontWeight: '500', marginBottom: '4px' },
    newsMeta: { fontSize: '12px', color: '#6C7086' },
    arrow: { color: '#89B4FA', fontSize: '18px' },
}
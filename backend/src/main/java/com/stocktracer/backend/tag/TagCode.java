package com.stocktracer.backend.tag;

/* tag 식별 코드 */
// 추후 investor flow 도 추가 필요
public enum TagCode {
    // 긍정
    UNDERVALUED("저평가", "가치에 비해 가격이 저렴", TagSentiment.POSITIVE),
    LOW_PER("저per", "이익 대비 저렴", TagSentiment.POSITIVE),
    LOW_PBR("저pbr", "자산 대비 저렴", TagSentiment.POSITIVE),
    HIGH_DIVIDED("고배당", "배당이 많음", TagSentiment.POSITIVE),

    // 부정
    VALUE_TRAP("밸류트랩 주의", "실적이 나빠서 가격이 저렴", TagSentiment.NEGATIVE),
    EARNING_SHRINKING("이익 감소", "수익 감소 중", TagSentiment.NEGATIVE);

    private final String label;
    private final String plain;
    private final TagSentiment sentiment;

    TagCode(String label, String plain, TagSentiment sentiment){
        this.label = label;
        this.plain = plain;
        this.sentiment = sentiment;
    }

    public String label(){return label;}
    public String plain(){return plain;}
    public TagSentiment sentiment(){return sentiment;}
}

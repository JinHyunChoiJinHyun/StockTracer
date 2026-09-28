package com.stocktracer.backend.tag;

import com.stocktracer.backend.annotation.MapperTest;
import com.stocktracer.backend.tag.domain.StockTag;
import com.stocktracer.backend.tag.domain.TagCode;
import com.stocktracer.backend.tag.domain.TagSnapshot;
import com.stocktracer.backend.tag.mapper.TagMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.tuple;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;


@MapperTest
public class TagSnapshotMapperTest {
    private static final LocalDate baseDate = LocalDate.of(2026, 9, 25);

    @Autowired
    TagMapper mapper;

    @Autowired
    JdbcTemplate jdbc;

    private void flow(String code, LocalDate date, String flowScore) {
        jdbc.update("""
                INSERT INTO investor_flow_analysis
                    (base_date, stock_code, flow_score, is_double_buy, is_clean_buy)
                VALUES (?, ?, ?, 0, 0) 
                """, date, code, dec(flowScore));
    }

    private void value(String code, LocalDate date, String valueScore, String divYield, Boolean valueTrap) {
        jdbc.update("""
                INSERT INTO value_fundamental
                    (base_date, stock_code, value_score, div_yield, value_trap)
                VALUES (?, ?, ?, ?, ?)
                """, date, code, dec(valueScore), dec(divYield), valueTrap);
    }

    private static BigDecimal dec(String s) {
        return s == null ? null : new BigDecimal(s);
    }

    private static StockTag tag(LocalDate date, String code, TagCode tagCode) {
        return new StockTag(date, code, tagCode);
    }

    private List<String> savedTags(LocalDate date) {
        return jdbc.queryForList(
                "SELECT CONCAT(stock_code, ':', tag_code) FROM stock_tag WHERE base_date = ?",
                String.class, date);
    }

    /* 조회 */
    @Test
    void 수급_분석이_없는_종목도_가치데이터와_함께_포함되다(){
        // investor_flow_analysis에 행이 없는 케이스
        value("000001", baseDate, "0.8000", "5.2000", false);

        assertThat(mapper.selectSnapshots(baseDate)).singleElement().satisfies(s -> {
            assertThat(s.stockCode()).isEqualTo("000001");
            assertThat(s.baseDate()).isEqualTo(baseDate);
            assertThat(s.flowScore()).isNull();
            assertThat(s.valueScore()).isEqualByComparingTo("0.8");
            assertThat(s.divYield()).isEqualByComparingTo("5.2");
            assertThat(s.valueTrap()).isFalse();
        });
    }

    @Test
    void 가치데이터가_없는_종목도_수급데이터와_함께_포함된다(){
        flow("000002", baseDate, "65.00");

        assertThat(mapper.selectSnapshots(baseDate)).singleElement().satisfies(s -> {
            assertThat(s.stockCode()).isEqualTo("000002");
            assertThat(s.baseDate()).isEqualTo(baseDate);
            assertThat(s.flowScore()).isEqualByComparingTo("65.00");
            assertThat(s.valueScore()).isNull();
            assertThat(s.divYield()).isNull();
            assertThat(s.valueTrap()).isNull();
        });
    }

    @Test
    void 양쪽에_모두_있는_종목은_하나로_합쳐진다(){
        flow("000003", baseDate, "70.00");
        value("000003", baseDate, "0.4000", "1.1000", true);

        assertThat(mapper.selectSnapshots(baseDate)).singleElement().satisfies(s -> {
            assertThat(s.flowScore()).isEqualByComparingTo("70.00");
            assertThat(s.valueScore()).isEqualByComparingTo("0.4");
            assertThat(s.valueTrap()).isTrue();
        });
    }

    @Test
    void 세가지_경우가_섞여도_종목당_한행이다(){
        flow("100001", baseDate, "10.00");                           // 수급만
        value("100002", baseDate, "0.2000", "3.0000", false);        // 가치만
        flow("100003", baseDate, "30.00");                           // 둘 다
        value("100003", baseDate, "0.4000", "2.0000", false);

        assertThat(mapper.selectSnapshots(baseDate))
                .extracting(TagSnapshot::stockCode)
                .containsExactlyInAnyOrder("100001", "100002", "100003")
                .doesNotHaveDuplicates();
    }

    @Test
    void 가치_지표의_NULL은_스냅샷에서도_NULL로_유지된다(){
        flow("000007", baseDate, "50.00");
        value("000007", baseDate, null, null, null);

        assertThat(mapper.selectSnapshots(baseDate)).singleElement().satisfies(s -> {
            assertThat(s.valueScore()).isNull();
            assertThat(s.divYield()).isNull();
            assertThat(s.valueTrap()).isNull();
        });
    }

    @Test
    void 다른_기준일_데이터는_섞이지_않는다(){
        flow("000004", baseDate, "50.00");
        flow("000005", baseDate.minusDays(1), "90.00");
        value("000005", baseDate.minusDays(1), "0.9000", "4.0000", false);
        value("000004", baseDate.plusDays(1), "0.3000", "1.0000", false);

        assertThat(mapper.selectSnapshots(baseDate))
                .extracting(TagSnapshot::stockCode, TagSnapshot::baseDate, TagSnapshot::valueScore)
                .containsExactly(tuple("000004", baseDate, null));
    }

    @Test
    void 해당_날짜_데이터가_없으면_빈_리스트_반환(){
        flow("000006", baseDate.minusDays(1), "50.00");

        assertThat(mapper.selectSnapshots(baseDate)).isEmpty();
    }

    /* 저장 */
    @Test
    void 여러_종목과_한_종목의_여러_태그_저장한다(){
        mapper.insertAll(List.of(
                tag(baseDate, "005930", TagCode.UNDERVALUED),
                tag(baseDate, "005930", TagCode.HIGH_DIVIDEND),
                tag(baseDate, "000660", TagCode.VALUE_TRAP)
        ));

        assertThat(savedTags(baseDate)).containsExactlyInAnyOrder(
                "005930:UNDERVALUED",
                "005930:HIGH_DIVIDEND",
                "000660:VALUE_TRAP");
    }

    /* 삭제 */
    @Test
    void 해당_날짜의_태그만_삭제한다(){
        mapper.insertAll(List.of(
                tag(baseDate, "005930", TagCode.UNDERVALUED),
                tag(baseDate.minusDays(1), "005930", TagCode.HIGH_DIVIDEND)
        ));

        mapper.deleteByBaseDate(baseDate);

        assertThat(savedTags(baseDate).isEmpty());
        assertThat(savedTags(baseDate.minusDays(1))).containsExactly("005930:HIGH_DIVIDEND");
    }

    @Test
    void 같은_날짜를_재계산하면_이전_태그는_남지않는다(){
        mapper.insertAll(List.of(
                tag(baseDate, "005930", TagCode.UNDERVALUED)
        ));

        mapper.deleteByBaseDate(baseDate);
        mapper.insertAll(List.of(
                tag(baseDate, "005930", TagCode.HIGH_DIVIDEND)
        ));

        assertThat(savedTags(baseDate)).containsExactly("005930:HIGH_DIVIDEND");
    }


}

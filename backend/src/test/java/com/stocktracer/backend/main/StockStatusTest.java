package com.stocktracer.backend.main;

import com.stocktracer.backend.main.domain.StockStatus;
import com.stocktracer.backend.tag.domain.TagCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.EnumSet;
import java.util.Set;

import static com.stocktracer.backend.tag.domain.TagCode.FLOW_STRONG;
import static com.stocktracer.backend.tag.domain.TagCode.UNDERVALUED;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class StockStatusTest {

    private static Set<TagCode> tags(TagCode... codes){ // 가변인자 == List없이 여러 파라미터 입력 가능
        return codes.length == 0 ? EnumSet.noneOf(TagCode.class) : Set.of(codes);
    }

    @Nested
    @DisplayName("권장")
    class Recommended{
        @Test
        void 수급_강세_저평가면_권장(){
            assertThat(StockStatus.resolve(tags(FLOW_STRONG,UNDERVALUED)))
                    .isEqualTo(StockStatus.RECOMMENDED);
        }
    }
}

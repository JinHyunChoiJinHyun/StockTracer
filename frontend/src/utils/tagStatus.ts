import type { StockTag } from "../types/stock";

export type TagStatus = "recommended" | "risk" | "normal";

export function getTagStatus(tags: StockTag[]): TagStatus {
  if (tags.includes("RISK")) {
    return "risk";
  }
  if (tags.includes("RECOMMENDED")) {
    return "recommended";
  }
  return "normal";
}

// 상태별로 카드에 덧붙일 CSS class 이름
export function getTagStatusClassName(status: TagStatus): string {
  if (status === "risk") {
    return "is-risk";
  }
  if (status === "recommended") {
    return "is-recommend";
  }
  return "";
}

// 카드의 태그 칩 줄에 보여줄 태그
// 권장·위험은 카드 테두리 색으로 이미 보여주므로 칩 목록에서는 뺀다.
export function getChipTags(tags: StockTag[]): StockTag[] {
  return tags.filter((tag) => tag !== "RECOMMENDED" && tag !== "RISK");
}
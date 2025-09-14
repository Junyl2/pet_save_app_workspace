export const REFUND_REASONS = {
  "고객 변심": [
    "단순변심",
    "다른 상품으로 구매하고 싶어요",
    "더 저렴한 곳을 찾았어요",
  ],
  "배송 문제": [
    "배송이 예상보다 늦어요",
    "택배 기사님이 친절하지 않아요",
    "박스 중 파손되었어요",
  ],
  "상품 문제": [
    "상품이 불량이에요",
    "화면과 실물이 달라요",
    "상품이 다르게 왔어요",
  ],
} as const;

export const REFUND_STEPS = [
  { key: "select", label: "상품 선택" },
  { key: "reason", label: "사유 선택" },
  { key: "method", label: "반품방법 확인" },
  { key: "confirm", label: "환불금액 확인" },
] as const;

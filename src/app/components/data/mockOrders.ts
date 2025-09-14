import { OrderItem } from "@/app/components/types/order";

export interface Order {
  orderNumber: string;
  status: string;
  date: string;
  item: OrderItem;
  recipientName: string;
}

export const mockOrders: Order[] = [
  {
    orderNumber: "202509100001",
    status: "주문 완료",
    date: "2025.09.10",
    recipientName: "홍길동",
    item: {
      product: {
        id: 101,
        name: "탐사 강아지 고구마말랭이 간식",
        price: 24000,
        brand: "ㅇㅇ 동물병원",
        image: "/images/products/cat-snacks.png",
      },
      quantity: 1,
    },
  },
  {
    orderNumber: "202509100002",
    status: "주문 취소",
    date: "2025.09.10",
    recipientName: "홍길동",
    item: {
      product: {
        id: 102,
        name: "탐사 강아지 고구마말랭이 간식",
        price: 24000,
        brand: "ㅇㅇ 동물병원",
        image: "/images/products/dog-treats.png",
      },
      quantity: 1,
    },
  },
  {
    orderNumber: "202509100003",
    status: "배송 준비중",
    date: "2025.09.10",
    recipientName: "홍길동",
    item: {
      product: {
        id: 103,
        name: "탐사 강아지 고구마말랭이 간식",
        price: 24000,
        brand: "ㅇㅇ 동물병원",
        image: "/images/products/sweet-potato.png",
      },
      quantity: 1,
    },
  },
  {
    orderNumber: "202509100004",
    status: "배송중",
    date: "2025.09.10",
    recipientName: "홍길동",
    item: {
      product: {
        id: 104,
        name: "탐사 강아지 고구마말랭이 간식",
        price: 24000,
        brand: "ㅇㅇ 동물병원",
        image: "/images/products/reptomin.png",
      },
      quantity: 1,
    },
  },
  {
    orderNumber: "202509100005",
    status: "배송 완료",
    date: "2025.09.10",
    recipientName: "홍길동",
    item: {
      product: {
        id: 105,
        name: "탐사 강아지 고구마말랭이 간식",
        price: 24000,
        brand: "ㅇㅇ 동물병원",
        image: "/images/products/dog-snack.png",
      },
      quantity: 1,
    },
  },
  {
    orderNumber: "202509100006",
    status: "교환 신청",
    date: "2025.09.10",
    recipientName: "홍길동",
    item: {
      product: {
        id: 106,
        name: "탐사 강아지 고구마말랭이 간식",
        price: 24000,
        brand: "ㅇㅇ 동물병원",
        image: "/images/products/dog-snack2.png",
      },
      quantity: 1,
    },
  },
  {
    orderNumber: "202509100007",
    status: "교환 완료",
    date: "2025.09.10",
    recipientName: "홍길동",
    item: {
      product: {
        id: 107,
        name: "탐사 강아지 고구마말랭이 간식",
        price: 24000,
        brand: "ㅇㅇ 동물병원",
        image: "/images/products/cat-snacks.png",
      },
      quantity: 1,
    },
  },
  {
    orderNumber: "202509100008",
    status: "환불 신청",
    date: "2025.09.10",
    recipientName: "홍길동",
    item: {
      product: {
        id: 108,
        name: "탐사 강아지 고구마말랭이 간식",
        price: 24000,
        brand: "ㅇㅇ 동물병원",
        image: "/images/products/dog-treats.png",
      },
      quantity: 1,
    },
  },
  {
    orderNumber: "202509100009",
    status: "환불 완료",
    date: "2025.09.10",
    recipientName: "홍길동",
    item: {
      product: {
        id: 109,
        name: "탐사 강아지 고구마말랭이 간식",
        price: 24000,
        brand: "ㅇㅇ 동물병원",
        image: "/images/products/sweet-potato.png",
      },
      quantity: 1,
    },
  },
];

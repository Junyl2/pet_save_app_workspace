'use client';

import React, { useMemo } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';

type Order = {
  id: string;
  orderedAt: string;
  buyer: string;
  contact: string;
  productName: string;
  canceledAt: string;
  cancelReason: string;
};

const PAGE_SIZE = 10;

const orders: Order[] = [
  {
    id: '20250401-001',
    orderedAt: '2025-04-01 11:32',
    buyer: '홍길동',
    contact: '010-0000-0000',
    productName: '상품명 / 옵션',
    canceledAt: '2025-04-01 18:32',
    cancelReason: '구매자 취소',
  },
  {
    id: '20250401-002',
    orderedAt: '2025-04-01 12:01',
    buyer: '김철수',
    contact: '010-1234-5678',
    productName: '강아지 사료 / 5kg',
    canceledAt: '2025-04-01 18:55',
    cancelReason: '결제 오류',
  },
  {
    id: '20250401-003',
    orderedAt: '2025-04-01 12:45',
    buyer: '이영희',
    contact: '010-1111-2222',
    productName: '고양이 모래 / 10L',
    canceledAt: '2025-04-01 19:20',
    cancelReason: '배송 지연',
  },
  {
    id: '20250401-004',
    orderedAt: '2025-04-01 13:10',
    buyer: '박민수',
    contact: '010-2222-3333',
    productName: '햄스터 케이지 / 소형',
    canceledAt: '2025-04-01 19:40',
    cancelReason: '상품 변경 요청',
  },
  {
    id: '20250401-005',
    orderedAt: '2025-04-01 13:47',
    buyer: '최지우',
    contact: '010-3333-4444',
    productName: '조류 사료 / 2kg',
    canceledAt: '2025-04-01 20:05',
    cancelReason: '중복 주문',
  },
  {
    id: '20250401-006',
    orderedAt: '2025-04-01 14:18',
    buyer: '정우성',
    contact: '010-4444-5555',
    productName: '고양이 하우스 / 그레이',
    canceledAt: '2025-04-01 20:30',
    cancelReason: '상품 불만족',
  },
  {
    id: '20250401-007',
    orderedAt: '2025-04-01 14:41',
    buyer: '김하나',
    contact: '010-5555-6666',
    productName: '강아지 간식 / 치킨맛',
    canceledAt: '2025-04-01 20:55',
    cancelReason: '구매자 취소',
  },
  {
    id: '20250401-008',
    orderedAt: '2025-04-01 15:10',
    buyer: '이도연',
    contact: '010-6666-7777',
    productName: '토끼 물병 / 500ml',
    canceledAt: '2025-04-01 21:15',
    cancelReason: '주소 오류',
  },
  {
    id: '20250401-009',
    orderedAt: '2025-04-01 15:40',
    buyer: '오지훈',
    contact: '010-7777-8888',
    productName: '어항 청소기 / 자동형',
    canceledAt: '2025-04-01 21:40',
    cancelReason: '결제 취소',
  },
  {
    id: '20250401-010',
    orderedAt: '2025-04-01 16:02',
    buyer: '윤서진',
    contact: '010-8888-9999',
    productName: '반려동물 샴푸 / 허브향',
    canceledAt: '2025-04-01 22:00',
    cancelReason: '구매자 취소',
  },
  {
    id: '20250401-011',
    orderedAt: '2025-04-01 16:25',
    buyer: '강지훈',
    contact: '010-9999-0000',
    productName: '고양이 캣타워 / 2단',
    canceledAt: '2025-04-01 22:20',
    cancelReason: '상품 변경 요청',
  },
  {
    id: '20250401-012',
    orderedAt: '2025-04-01 16:47',
    buyer: '김예린',
    contact: '010-0001-2222',
    productName: '강아지 옷 / 블루 M',
    canceledAt: '2025-04-01 22:40',
    cancelReason: '배송 지연',
  },
  {
    id: '20250401-013',
    orderedAt: '2025-04-01 17:05',
    buyer: '이재훈',
    contact: '010-1231-5555',
    productName: '고양이 캔 / 참치맛 12팩',
    canceledAt: '2025-04-01 23:00',
    cancelReason: '결제 오류',
  },
  {
    id: '20250401-014',
    orderedAt: '2025-04-01 17:22',
    buyer: '정수빈',
    contact: '010-2232-6666',
    productName: '펫매트 / 방수형',
    canceledAt: '2025-04-01 23:15',
    cancelReason: '구매자 취소',
  },
  {
    id: '20250401-015',
    orderedAt: '2025-04-01 17:47',
    buyer: '최준호',
    contact: '010-9988-8877',
    productName: '자동 급식기 / 화이트',
    canceledAt: '2025-04-01 23:35',
    cancelReason: '결제 실패',
  },
];

export default function ExchangeRequestPage() {
  const { page, setPage } = usePageParam(1);

  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>주문번호</div>
          <div>주문일시</div>
          <div>주문자</div>
          <div>연락처</div>
          <div>상품명</div>
          <div>주문 취소일시</div>
          <div>취소 이유</div>
        </div>

        {pagedOrders.map((order) => (
          <div key={order.id} className={styles.row}>
            <div>{order.id}</div>
            <div>{order.orderedAt}</div>
            <div>{order.buyer}</div>
            <div>{order.contact}</div>
            <div>{order.productName}</div>
            <div>{order.canceledAt}</div>
            <div>{order.cancelReason}</div>
          </div>
        ))}
      </div>

      {total > PAGE_SIZE && (
        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}
        >
          <div style={{ width: 320 }}>
            <OrderPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </>
  );
}

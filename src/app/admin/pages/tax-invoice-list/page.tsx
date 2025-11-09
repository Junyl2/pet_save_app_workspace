'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { invoiceService } from '@/app/api/services/admin/invoiceService/invoiceService';
import { InvoiceItem } from '@/app/api/services/admin/invoiceService/invoiceTypes';
import { useOrderFilter } from '@/app/context/orderFilterContext';

const PAGE_SIZE = 10;

export default function DocumentListPage() {
  const { page, setPage } = usePageParam(1);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const { filters, filterTrigger } = useOrderFilter();

  const fetchInvoices = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: {
        page: number;
        size: number;
        sortBy: 'createdAt';
        direction: 'desc';
        keyword?: string;
        createdStart?: string;
        createdEnd?: string;
      } = {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      };

      if (filters.dateStart) {
        params.createdStart = filters.dateStart;
      }
      if (filters.dateEnd) {
        params.createdEnd = filters.dateEnd;
      }
      if (filters.keyword) {
        params.keyword = filters.keyword;
      }

      const { data, error } = await invoiceService.searchInvoices(params);

      if (error || !data?.success) {
        console.error('Failed to fetch invoices:', error || data?.resultMsg);
        setInvoices([]);
        setTotalPages(1);
        return;
      }

      setInvoices(data.data.content ?? []);
      setTotalPages(data.data.pageInfo.totalPages || 1);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setInvoices([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, filters.dateStart, filters.dateEnd, filters.keyword, filterTrigger]);

  useEffect(() => {
    if (filterTrigger > 0 && page !== 1) {
      setPage(1);
    }
  }, [filterTrigger, page, setPage]);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  return (
    <>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>주문번호</div>
          <div>주문일시</div>
          <div>주문자</div>
          <div>거래증빙서류</div>
          <div>발행번호</div>
          <div>결제금액</div>
          <div>상태</div>
        </div>

        {/* Loading State */}
        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {/* Empty State */}
        {!loading && invoices.length === 0 && (
          <div className={styles.empty}>조회된 송장이 없습니다.</div>
        )}

        {/* Data Rows */}
        {!loading &&
          invoices.map((inv) => (
            <div key={inv.invoiceId} className={styles.row}>
              <div>{inv.orderNumber ?? '-'}</div>
              <div>
                {inv.orderDate
                  ? new Date(inv.orderDate).toLocaleString('ko-KR')
                  : '-'}
              </div>
              <div>{inv.customerName ?? '-'}</div>
              <div>
                {inv.invoiceType === 'GENERAL_INVOICE'
                  ? '일반 영수증'
                  : inv.invoiceType === 'TAX_INVOICE'
                  ? '세금계산서'
                  : inv.invoiceType === 'CASH_RECEIPT'
                  ? '현금영수증'
                  : '-'}
              </div>
              {/*  Updated to use invoiceNumber for 발행번호 */}
              <div>{inv.invoiceNumber ?? '-'}</div>
              <div>
                {inv.totalAmount
                  ? `${new Intl.NumberFormat('ko-KR').format(
                      inv.totalAmount
                    )}원`
                  : '-'}
              </div>
              <div>
                {inv.status === 'PENDING'
                  ? '대기중'
                  : inv.status === 'ISSUED'
                  ? '발행완료'
                  : inv.status === 'CANCELLED'
                  ? '취소됨'
                  : '-'}
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}
        >
          <div style={{ width: 320 }}>
            <OrderPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </>
  );
}

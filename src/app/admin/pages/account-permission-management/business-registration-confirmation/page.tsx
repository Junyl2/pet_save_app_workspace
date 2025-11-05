'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';
import { BusinessRegistrationSummary } from '@/app/api/types/auth/BusinessRegistration';

type StatusLabel = '승인 대기' | '승인 완료' | '반려';

const STATUS_COLORS: Record<StatusLabel, string> = {
  '승인 대기': '#E9B430',
  '승인 완료': '#009329',
  반려: '#EA080C',
};

const PAGE_SIZE = 10;

export default function BusinessRegistrationConfirmationPage() {
  const router = useRouter();
  const { page, setPage } = usePageParam(1);
  const [registrations, setRegistrations] = useState<
    BusinessRegistrationSummary[]
  >([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const mapStatusToLabel = (status: string): StatusLabel => {
    switch (status) {
      case 'APPROVED':
        return '승인 완료';
      case 'REJECTED':
        return '반려';
      default:
        return '승인 대기';
    }
  };

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const response =
          await BusinessRegistrationService.getAllBusinessRegistrations({
            page: page - 1,
            size: PAGE_SIZE,
            sortBy: 'createdAt',
            direction: 'desc',
          });

        if (response.error || !response.data?.success) {
          console.error('❌ Failed to fetch registrations:', response.error);
          setRegistrations([]);
          return;
        }

        const data = response.data.data.content ?? [];
        setRegistrations(data);
        setTotalPages(response.data.data.pageInfo?.totalPages ?? 1);
      } catch (error) {
        console.error('Error loading business registrations:', error);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchRegistrations();
  }, [page]);

  const openInvoice = (item: BusinessRegistrationSummary): void => {
    const query = new URLSearchParams({
      name: item.applicantName,
      nickname: item.applicantNickname,
      email: item.applicantEmail,
      phone: item.applicantPhoneNumber,
      addressLine: item.roadAddress ?? '',
      zipOrDetail: item.zipCode ?? '',
    }).toString();

    router.push(
      `/admin/pages/account-permission-management/general-member/regular-member/${item.applicantId}?${query}`
    );
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.headerRow}>
          <div className={styles.col}>이름</div>
          <div className={styles.col}>닉네임</div>
          <div className={styles.col}>연락처</div>
          <div className={styles.col}>이메일</div>
          <div className={styles.col}>요청상태</div>
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && registrations.length === 0 && (
          <div className={styles.empty}>사업자 등록 요청이 없습니다.</div>
        )}

        {!loading &&
          registrations.map((reg) => {
            const statusLabel = mapStatusToLabel(reg.status);
            return (
              <div
                key={reg.requestId}
                className={styles.dataRow}
                role="button"
                tabIndex={0}
                onClick={() => openInvoice(reg)}
                onKeyDown={(e) =>
                  (e.key === 'Enter' || e.key === ' ') && openInvoice(reg)
                }
                aria-label={`${reg.applicantName} 정보 보기`}
              >
                <div className={styles.col}>{reg.applicantName}</div>
                <div className={styles.col}>{reg.applicantNickname}</div>
                <div className={styles.col}>{reg.applicantPhoneNumber}</div>
                <div className={styles.col}>{reg.applicantEmail}</div>
                <div
                  className={styles.col}
                  style={{
                    color: STATUS_COLORS[statusLabel],
                    fontWeight: 600,
                  }}
                >
                  {statusLabel}
                </div>
                <div className={styles.actions}>
                  <button className={styles.cancelBtn}>취소</button>
                  <button className={styles.approveBtn}>승인</button>
                </div>
              </div>
            );
          })}
      </div>

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

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';

interface Member {
  id: string;
  name: string;
  nickname: string;
  contact: string;
  email: string;
  status: '승인 대기' | '승인 완료' | '반려';
}

const STATUS_COLORS: Record<Member['status'], string> = {
  '승인 대기': '#E9B430',
  '승인 완료': '#009329',
  반려: '#EA080C',
};

const PAGE_SIZE = 10;

export default function BusinessRegistrationConfirmationPage() {
  const router = useRouter();
  const { page, setPage } = usePageParam(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  /** Fetch business registration data */
  const fetchBusinessRegistrations = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response =
        await BusinessRegistrationService.getAllBusinessRegistrations({
          page: page - 1,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
        });

      const data = (response?.data as any)?.data;
      const content = data?.content ?? [];
      setTotalPages(data?.totalPages ?? 1);

      const mapped: Member[] = content.map((item: any) => ({
        id: item.requestId,
        name: item.applicantName ?? '-',
        nickname: item.applicantNickname ?? '-',
        contact: item.applicantPhoneNumber ?? '-',
        email: item.applicantEmail ?? '-',
        status:
          item.status === 'APPROVED'
            ? '승인 완료'
            : item.status === 'REJECTED'
            ? '반려'
            : '승인 대기',
      }));

      setMembers(mapped);
    } catch (error) {
      console.error('❌ Failed to fetch business registrations:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchBusinessRegistrations();
  }, [fetchBusinessRegistrations]);

  /** Approve registration */
  const handleApprove = async (requestId: string): Promise<void> => {
    if (!confirm('해당 사업자 등록을 승인하시겠습니까?')) return;
    setProcessingId(requestId);
    try {
      await BusinessRegistrationService.approveBusinessRegistration(requestId, {
        adminNotes: '관리자 승인 완료',
      });
      alert('승인되었습니다.');
      await fetchBusinessRegistrations();
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  /** Reject registration */
  const handleReject = async (requestId: string): Promise<void> => {
    const reason = prompt('거절 사유를 입력하세요:');
    if (!reason) return;
    setProcessingId(requestId);
    try {
      await BusinessRegistrationService.rejectBusinessRegistration(requestId, {
        rejectionReason: reason,
        adminNotes: '관리자 검토 후 거절',
      });
      alert('거절되었습니다.');
      await fetchBusinessRegistrations();
    } catch (error) {
      console.error('거절 실패:', error);
      alert('거절 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const openInvoice = (member: Member): void => {
    const query = new URLSearchParams({
      name: member.name,
      nickname: member.nickname,
      email: member.email,
      phone: member.contact,
      addressLine: '서울특별시 마포구 백범로 192',
      zipOrDetail: '04196',
    }).toString();

    router.push(
      `/admin/pages/account-permission-management/general-member/regular-member/${member.id}?${query}`
    );
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

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

        {members.length === 0 ? (
          <div className={styles.empty}>등록된 사업자 신청이 없습니다.</div>
        ) : (
          members.map((member) => (
            <div key={member.id} className={styles.dataRow}>
              <div className={styles.col}>{member.name}</div>
              <div className={styles.col}>{member.nickname}</div>
              <div className={styles.col}>{member.contact}</div>
              <div className={styles.col}>{member.email}</div>
              <div
                className={styles.col}
                style={{
                  color: STATUS_COLORS[member.status],
                  fontWeight: 600,
                }}
              >
                {member.status}
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.cancelBtn}
                  disabled={processingId === member.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleReject(member.id);
                  }}
                >
                  {processingId === member.id ? '반려...' : '반려'}
                </button>
                <button
                  className={styles.approveBtn}
                  disabled={processingId === member.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleApprove(member.id);
                  }}
                >
                  {processingId === member.id ? '처리 중...' : '승인'}
                </button>
              </div>
            </div>
          ))
        )}
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

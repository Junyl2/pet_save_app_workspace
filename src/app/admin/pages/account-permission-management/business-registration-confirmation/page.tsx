'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';
import { useOrderFilter } from '@/app/context/orderFilterContext';
import { ConfirmationModal } from '@/app/components/admin/ui/ConfirmationModal/ConfirmationModal';
import { InputModal } from '@/app/components/admin/ui/InputModal/InputModal';
import { useToast } from '@/app/components/admin/hooks/useToast';
import { ToastContainer } from '@/app/components/admin/ui/ToastContainer/ToastContainer';

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
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectInputOpen, setRejectInputOpen] = useState(false);
  const [requestToProcess, setRequestToProcess] = useState<string | null>(null);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const { filters, filterTrigger } = useOrderFilter();

  /** Fetch business registration data */
  const fetchBusinessRegistrations = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params: {
        page: number;
        size: number;
        sortBy: 'createdAt';
        direction: 'desc';
        keyword?: string;
        dateStart?: string;
        dateEnd?: string;
      } = {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      };

      if (filters.dateStart?.trim()) {
        const dateStart = filters.dateStart.trim();
        params.dateStart = dateStart.includes('T')
          ? dateStart.split('T')[0]
          : dateStart;
      }
      if (filters.dateEnd?.trim()) {
        const dateEnd = filters.dateEnd.trim();
        params.dateEnd = dateEnd.includes('T')
          ? dateEnd.split('T')[0]
          : dateEnd;
      }
      if (filters.keyword?.trim()) {
        params.keyword = filters.keyword.trim();
      }

      const response =
        await BusinessRegistrationService.getAllBusinessRegistrations(params);

      if (response.error) {
        console.error('Error fetching business registrations:', response.error);
        setMembers([]);
        return;
      }

      // Debug: Log the full response to understand structure
      console.log('🔍 Full API Response:', JSON.stringify(response, null, 2));

      // API response structure from GET /business-registrations:
      // { success: true, status: 200, resultMsg: "...", data: { content: [], pageInfo: {} } }
      // apiClient.get returns { data: <API response>, error?: string }
      // So response.data is the full API response object
      const apiResponse = response?.data as any;
      console.log('🔍 API Response object:', apiResponse);

      // Extract the nested data object which contains content and pageInfo
      // Try both possible structures: response.data.data or response.data
      let data = apiResponse?.data;

      // If data is not nested, check if apiResponse itself has content
      if (!data && apiResponse?.content) {
        data = apiResponse;
      }

      if (!data) {
        console.error(
          '❌ Invalid response structure. apiResponse:',
          apiResponse
        );
        setMembers([]);
        return;
      }

      console.log('🔍 Extracted data object:', data);
      console.log('🔍 Content array:', data.content);
      console.log('🔍 First item sample:', data.content?.[0]);

      const content = Array.isArray(data.content) ? data.content : [];
      const pageInfo = data.pageInfo || {};

      console.log('🔍 Content length:', content.length);
      console.log('🔍 PageInfo:', pageInfo);

      setTotalPages(pageInfo.totalPages ?? 1);

      const mapped: Member[] = content.map((item: any, index: number) => {
        // Debug each item
        console.log(`🔍 Mapping item ${index}:`, {
          requestId: item.requestId,
          applicantName: item.applicantName,
          businessEmail: item.businessEmail,
          applicantNickname: item.applicantNickname,
          applicantPhoneNumber: item.applicantPhoneNumber,
          status: item.status,
        });

        // Map fields from API response to Member interface
        // Using exact field names from the API response
        const member: Member = {
          id: item.requestId || '-',
          name: item.applicantName || '-',
          nickname: item.applicantNickname || '-',
          contact: item.applicantPhoneNumber || '-',
          email: item.businessEmail || '-',
          status:
            item.status === 'APPROVED'
              ? '승인 완료'
              : item.status === 'REJECTED'
              ? '반려'
              : '승인 대기',
        };

        console.log(`✅ Mapped member ${index}:`, member);
        return member;
      });

      console.log('✅ Final mapped members:', mapped);
      setMembers(mapped);
    } catch (error) {
      console.error('❌ Failed to fetch business registrations:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters.dateStart, filters.dateEnd, filters.keyword]);

  useEffect(() => {
    if (filterTrigger > 0 && page !== 1) {
      setPage(1);
    }
  }, [filterTrigger, page, setPage]);

  useEffect(() => {
    void fetchBusinessRegistrations();
  }, [fetchBusinessRegistrations]);

  /** Approve registration */
  const handleApproveClick = (requestId: string): void => {
    setRequestToProcess(requestId);
    setApproveConfirmOpen(true);
  };

  const handleApprove = async (): Promise<void> => {
    if (!requestToProcess) return;
    setProcessingId(requestToProcess);
    setApproveConfirmOpen(false);
    try {
      await BusinessRegistrationService.approveBusinessRegistration(
        requestToProcess,
        {
          adminNotes: '관리자 승인 완료',
        }
      );
      showSuccess('승인되었습니다.');
      await fetchBusinessRegistrations();
    } catch (error) {
      console.error('승인 실패:', error);
      showError('승인 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
      setRequestToProcess(null);
    }
  };

  /** Reject registration */
  const handleRejectClick = (requestId: string): void => {
    setRequestToProcess(requestId);
    setRejectInputOpen(true);
  };

  const handleReject = async (reason: string): Promise<void> => {
    if (!requestToProcess || !reason) return;
    setProcessingId(requestToProcess);
    setRejectInputOpen(false);
    try {
      await BusinessRegistrationService.rejectBusinessRegistration(
        requestToProcess,
        {
          rejectionReason: reason,
          adminNotes: '관리자 검토 후 거절',
        }
      );
      showSuccess('거절되었습니다.');
      await fetchBusinessRegistrations();
    } catch (error) {
      console.error('거절 실패:', error);
      showError('거절 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
      setRequestToProcess(null);
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
                    handleRejectClick(member.id);
                  }}
                >
                  {processingId === member.id ? '반려...' : '반려'}
                </button>
                <button
                  className={styles.approveBtn}
                  disabled={processingId === member.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveClick(member.id);
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

      <ConfirmationModal
        open={approveConfirmOpen}
        onClose={() => {
          setApproveConfirmOpen(false);
          setRequestToProcess(null);
        }}
        onConfirm={handleApprove}
        message="해당 사업자 등록을 승인하시겠습니까?"
        confirmText="승인"
        cancelText="취소"
      />

      <InputModal
        open={rejectInputOpen}
        onClose={() => {
          setRejectInputOpen(false);
          setRequestToProcess(null);
        }}
        onConfirm={handleReject}
        title="거절 사유 입력"
        message="거절 사유를 입력하세요:"
        placeholder="거절 사유를 입력하세요"
        confirmText="거절"
        cancelText="취소"
        inputType="textarea"
      />

      <ToastContainer toast={toast} onClose={hideToast} />
    </>
  );
}

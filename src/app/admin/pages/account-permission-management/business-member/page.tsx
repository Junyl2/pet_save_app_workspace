'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { BusinessRegistrationService } from '@/app/api/services/client/auth/businessRegistrationService';
import MemberDetailModal from './business-owner/[id]/MemberDetailModal';
import { useOrderFilter } from '@/app/context/orderFilterContext';

const PAGE_SIZE = 10;

interface BusinessMember {
  memberId: string;
  requestId: string;
  name: string;
  phoneNumber: string;
  email: string;
  classification: string;
}

export default function BusinessMemberPage() {
  const { page, setPage } = usePageParam(1);

  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<BusinessMember | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const { filters, filterTrigger } = useOrderFilter();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        size: number;
        sortBy: 'createdAt';
        direction: 'desc';
        status: 'APPROVED';
        keyword?: string;
        dateStart?: string;
        dateEnd?: string;
      } = {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
        status: 'APPROVED',
      };

      if (filters.dateStart?.trim()) {
        const dateStart = filters.dateStart.trim();
        params.dateStart = dateStart.includes('T') ? dateStart.split('T')[0] : dateStart;
      }
      if (filters.dateEnd?.trim()) {
        const dateEnd = filters.dateEnd.trim();
        params.dateEnd = dateEnd.includes('T') ? dateEnd.split('T')[0] : dateEnd;
      }
      if (filters.keyword?.trim()) {
        params.keyword = filters.keyword.trim();
      }

      const response =
        await BusinessRegistrationService.getAllBusinessRegistrations(params);

      if (response.error) {
        console.error('Failed to fetch business registrations:', response.error);
        setMembers([]);
        return;
      }

      const apiResponse = response?.data as any;

      // Extract the nested data object which contains content and pageInfo
      // Try both possible structures: response.data.data or response.data
      let data = apiResponse?.data;

      // If data is not nested, check if apiResponse itself has content
      if (!data && apiResponse?.content) {
        data = apiResponse;
      }

      if (!data) {
        console.error('Invalid response structure:', apiResponse);
        setMembers([]);
        return;
      }

      const content = Array.isArray(data.content) ? data.content : [];
      const pageInfo = data.pageInfo || {};

      setTotalPages(pageInfo.totalPages ?? 1);

      const mapped: BusinessMember[] = content.map((item: any) => {
        return {
          memberId: item.memberId || item.requestId || '',
          requestId: item.requestId || '',
          name: item.applicantName || '-',
          phoneNumber: item.applicantPhoneNumber || '-',
          email: item.businessEmail || '-',
          classification: '사업자',
        };
      });

      setMembers(mapped);
    } catch (error) {
      console.error('Error loading business members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters.dateStart, filters.dateEnd, filters.keyword]);

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (filterTrigger > 0 && page !== 1) {
      setPage(1);
    }
  }, [filterTrigger, page, setPage]);

  /** Open modal */
  const handleOpenModal = (member: BusinessMember): void => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  /** Close modal */
  const handleCloseModal = (): void => {
    setModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.headerRow}>
          <div className={styles.col}>이름</div>
          {/*        <div className={styles.col}>닉네임</div> */}
          <div className={styles.col}>연락처</div>
          <div className={styles.col}>이메일</div>
          <div className={styles.col}>회원분류</div>
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && members.length === 0 && (
          <div className={styles.empty}>사업자 회원이 없습니다.</div>
        )}

        {!loading &&
          members.map((member) => (
            <div
              key={member.memberId || member.requestId}
              className={styles.dataRow}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenModal(member)}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && handleOpenModal(member)
              }
              aria-label={`${member.name} 상세 보기`}
            >
              <div className={styles.col}>{member.name ?? '-'}</div>
              {/*         <div className={styles.col}>{member.name ?? '-'}</div> */}
              <div className={styles.col}>{member.phoneNumber ?? '-'}</div>
              <div className={styles.col}>{member.email ?? '-'}</div>
              <div className={styles.col}>
                {member.classification ?? '사업자'}
              </div>
            </div>
          ))}

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
      </div>

      {/* Detail Modal */}
      <MemberDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        memberId={selectedMember?.memberId ?? null}
      />
    </>
  );
}

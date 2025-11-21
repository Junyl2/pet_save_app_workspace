'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import {
  MemberService,
  MemberSummary,
} from '@/app/api/services/client/memberService/memberService';
import { useOrderFilter } from '@/app/context/orderFilterContext';
import MemberDetailModal from './regular-member/[id]/MemberDetailModal';

const PAGE_SIZE = 10;

export default function GeneralMemberPage() {
  const { page, setPage } = usePageParam(1);

  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const { filters, filterTrigger } = useOrderFilter();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const params: {
          page: number;
          size: number;
          sortBy: string;
          direction: 'desc';
          keyword?: string;
          dateStart?: string;
          dateEnd?: string;
          role?: 'ADMIN' | 'USER' | 'SELLER';
        } = {
          page: page - 1,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
          role: 'USER',
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

        const response = await MemberService.getMembersList(params);

        if (response.error || !response.data?.success) {
          console.error('Failed to fetch members:', response.error);
          setMembers([]);
          return;
        }

        const data = response.data.data;
        setMembers(data.content ?? []);
        setTotalPages(data.pageInfo?.totalPages ?? 1);
      } catch (error) {
        console.error('Error loading members:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchMembers();
  }, [
    page,
    filters.dateStart,
    filters.dateEnd,
    filters.keyword,
    filterTrigger,
  ]);

  useEffect(() => {
    if (filterTrigger > 0 && page !== 1) {
      setPage(1);
    }
  }, [filterTrigger, page, setPage]);

  /** Open modal */
  const handleOpenModal = (member: MemberSummary): void => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  /** Close modal */
  const handleCloseModal = (): void => {
    setModalOpen(false);
    setSelectedMember(null);
  };

  /** Refresh members list after update/delete */
  const handleUpdate = (): void => {
    // Trigger refetch by updating filterTrigger or just refetch
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const params: {
          page: number;
          size: number;
          sortBy: string;
          direction: 'desc';
          keyword?: string;
          dateStart?: string;
          dateEnd?: string;
          role?: 'ADMIN' | 'USER' | 'SELLER';
        } = {
          page: page - 1,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
          role: 'USER',
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

        const response = await MemberService.getMembersList(params);

        if (response.error || !response.data?.success) {
          console.error('Failed to fetch members:', response.error);
          setMembers([]);
          return;
        }

        const data = response.data.data;
        setMembers(data.content ?? []);
        setTotalPages(data.pageInfo?.totalPages ?? 1);
      } catch (error) {
        console.error('Error loading members:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchMembers();
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.headerRow}>
          <div className={styles.col}>이름</div>
          <div className={styles.col}>닉네임</div>
          <div className={styles.col}>연락처</div>
          <div className={styles.col}>이메일</div>
          <div className={styles.col}>회원분류</div>
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && members.length === 0 && (
          <div className={styles.empty}>등록된 회원이 없습니다.</div>
        )}

        {!loading &&
          members.map((member) => (
            <div
              key={member.memberId}
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
              <div className={styles.col}>{member.nickname ?? '-'}</div>
              <div className={styles.col}>{member.phoneNumber ?? '-'}</div>
              <div className={styles.col}>{member.email ?? '-'}</div>
              <div className={styles.col}>{member.classification ?? '-'}</div>
            </div>
          ))}
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

      {/* Detail Modal */}
      <MemberDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        memberId={selectedMember?.memberId ?? null}
        onUpdate={handleUpdate}
      />
    </>
  );
}

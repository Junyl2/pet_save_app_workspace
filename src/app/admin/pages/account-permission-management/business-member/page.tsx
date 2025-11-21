'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import {
  MemberService,
  MemberSummary,
} from '@/app/api/services/client/memberService/memberService';
import MemberDetailModal from './business-owner/[id]/MemberDetailModal';
import { useOrderFilter } from '@/app/context/orderFilterContext';

const PAGE_SIZE = 10;

export default function BusinessMemberPage() {
  const { page, setPage } = usePageParam(1);

  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const { filters, filterTrigger } = useOrderFilter();

  const fetchMembers = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc' as const,
        role: 'SELLER' as const,
        keyword: undefined as string | undefined,
        dateStart: undefined as string | undefined,
        dateEnd: undefined as string | undefined,
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
        console.error('Failed to fetch seller members:', response.error);
        setMembers([]);
        return;
      }

      const data = response.data.data;

      setMembers(data.content ?? []);
      setTotalPages(data.pageInfo?.totalPages ?? 1);
    } catch (error) {
      console.error('Error loading sellers:', error);
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

  const handleOpenModal = (member: MemberSummary): void => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setModalOpen(false);
    setSelectedMember(null);
  };

  const handleUpdate = (): void => {
    void fetchMembers();
  };

  return (
    <>
      <div className={styles.wrapper}>
        {/* ===== HEADER ===== */}
        <div className={styles.headerRow}>
          <div className={styles.col}>이름</div>
          <div className={styles.col}>닉네임</div>
          <div className={styles.col}>연락처</div>
          <div className={styles.col}>이메일</div>

          {/* 신고 header (Figma exact icon) */}
          <div
            className={styles.col}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ color: '#1F4A31', fontWeight: 500 }}>신고</span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: 20,
                justifyContent: 'center',
              }}
            >
              <svg width="10" height="5" viewBox="0 0 10 5" fill="none">
                <path
                  d="M1 4L5 1L9 4"
                  stroke="#1F4A31"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg width="10" height="5" viewBox="0 0 10 5" fill="none">
                <path
                  d="M1 1L5 4L9 1"
                  stroke="#1F4A31"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className={styles.col}>회원분류</div>
        </div>

        {/* ===== LOADING ===== */}
        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {/* ===== EMPTY STATE ===== */}
        {!loading && members.length === 0 && (
          <div className={styles.empty}>사업자 회원이 없습니다.</div>
        )}

        {/* ===== ROWS ===== */}
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

              {/* 신고 count */}
              <div
                className={styles.col}
                style={{ color: '#1F4A31', fontWeight: 500 }}
              >
                {member.numberOfReports ?? 0}
              </div>

              <div className={styles.col}>
                {member.classification ?? '판매자'}
              </div>
            </div>
          ))}

        {/* ===== PAGINATION ===== */}
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

      {/* ===== MODAL ===== */}
      <MemberDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        memberId={selectedMember?.memberId ?? null}
        onUpdate={handleUpdate}
      />
    </>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import {
  MemberService,
  MemberSummary,
} from '@/app/api/services/client/memberService/memberService';

const PAGE_SIZE = 10;

export default function GeneralMemberPage() {
  const router = useRouter();
  const { page, setPage } = usePageParam(1);

  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const response = await MemberService.getMembersList({
          page: page - 1,
          size: PAGE_SIZE,
          sortBy: 'createdAt',
          direction: 'desc',
        });

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
  }, [page]);

  /** Open member detail page */
  const openMemberDetail = (member: MemberSummary) => {
    router.push(
      `/admin/pages/account-permission-management/general-member/regular-member/${member.memberId}`
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
              onClick={() => openMemberDetail(member)}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && openMemberDetail(member)
              }
              aria-label={`${member.name} 상세 보기`}
            >
              <div className={styles.col}>{member.name ?? '-'}</div>
              <div className={styles.col}>{member.name ?? '-'}</div>
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
    </>
  );
}

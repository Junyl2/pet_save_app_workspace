'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './BlockListPage.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { BlockService } from '@/app/api/services/client/memberService/block/blockService';
import { MemberService } from '@/app/api/services/client/memberService/memberService';
import { StoreService } from '@/app/api/services/client/storeService/storeService';
import ClientPagination from '@/app/components/admin/ui/ClientPagination/ClientPagination';
import Loading from '@/app/components/ui/Loading/Loading';
import toast from 'react-hot-toast';
import { BlockedStore } from '@/app/api/types/member/block/block';

const PAGE_SIZE = 10;

type BlockedStoreWithImage = BlockedStore & {
  businessProfileImage?: string | null;
};
export default function BlockListPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [blockedStores, setBlockedStores] = useState<BlockedStoreWithImage[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchMemberId = async () => {
    try {
      const res = await MemberService.getMyInfo();
      if (res.error || !res.data?.data) {
        toast.error('회원 정보를 불러오지 못했습니다.');
        setLoading(false);
        return;
      }
      setMemberId(res.data.data.memberId);
    } catch (error) {
      console.error('[BlockListPage] Failed to get member info:', error);
      toast.error('회원 정보를 가져오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const fetchBlockedStores = async (id: string, page: number) => {
    setLoading(true);
    try {
      const res = await BlockService.getBlocksByMember(id, {
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        direction: 'desc',
      });

      if (res.error || !res.data?.data) {
        toast.error(res.error || '차단 목록을 불러오지 못했습니다.');
        setBlockedStores([]);
        return;
      }

      const { content, pageInfo } = res.data.data;

      // fetch each store's profile image in parallel
      const storesWithImages = await Promise.all(
        content.map(async (store) => {
          try {
            const storeRes = await StoreService.getStoreDetails(store.storeId);
            const image =
              storeRes.data?.data?.businessProfileImage ??
              '/images/default-store.png';
            return { ...store, businessProfileImage: image };
          } catch {
            return {
              ...store,
              businessProfileImage: '/images/default-store.png',
            };
          }
        })
      );

      setBlockedStores(storesWithImages);
      setTotalPages(pageInfo.totalPages);
    } catch (error) {
      console.error('[BlockListPage] Fetch block list error:', error);
      toast.error('차단 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (storeId: string, storeName: string) => {
    setIsProcessing(storeId);
    try {
      const res = await BlockService.toggleBlockStore(storeId);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      const isUnblocked =
        res.data?.resultMsg?.includes('unblocked') ||
        res.data?.resultMsg?.includes('해제');

      if (isUnblocked) {
        toast.success(`${storeName} 차단을 해제했습니다.`);
        setBlockedStores((prev) => prev.filter((s) => s.storeId !== storeId));
      } else {
        toast.success(`${storeName} 차단되었습니다.`);
      }
    } catch (err) {
      console.error('[BlockListPage] unblock error:', err);
      toast.error('요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    fetchMemberId();
  }, []);

  useEffect(() => {
    if (memberId) fetchBlockedStores(memberId, currentPage);
  }, [memberId, currentPage]);

  if (loading) return <Loading />;

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        {/*   {blockedStores.length !== 0 && (
          <h1 className={styles.title}>차단 목록</h1>
        )} */}

        {!memberId ? (
          <div className={styles.emptyState}>
            <IllustrationEmpty />
            <p>로그인이 필요합니다.</p>
          </div>
        ) : blockedStores.length === 0 ? (
          <div className={styles.emptyState}>
            <IllustrationEmpty />
            <p>차단한 가게가 없습니다.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {blockedStores.map((store) => (
              <li key={store.blockId} className={styles.listItem}>
                <div className={styles.avatarWrap}>
                  <Image
                    src={
                      store.businessProfileImage || '/images/default-store.png'
                    }
                    alt={store.storeName}
                    width={50}
                    height={50}
                    className={styles.avatar}
                  />
                </div>

                <div className={styles.infoWrap}>
                  <p className={styles.storeName}>{store.storeName}</p>
                  <p className={styles.date}>
                    차단일:{' '}
                    {new Date(store.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </p>
                </div>

                <button
                  className={styles.unblockBtn}
                  disabled={isProcessing === store.storeId}
                  onClick={() => handleUnblock(store.storeId, store.storeName)}
                >
                  {isProcessing === store.storeId ? '해제 중...' : '차단 해제'}
                </button>
              </li>
            ))}
          </ul>
        )}

        {memberId && totalPages > 1 && (
          <div className={styles.pagination}>
            <ClientPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );
}

function IllustrationEmpty() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 300"
      width="180"
      height="180"
      aria-hidden="true"
    >
      <circle cx="200" cy="150" r="120" fill="#E8F8F4" />
      <path
        d="M120 170c20-40 60-70 80-70s60 30 80 70"
        stroke="#66BFA7"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="160" cy="130" r="6" fill="#66BFA7" />
      <circle cx="240" cy="130" r="6" fill="#66BFA7" />
      <path
        d="M160 195c15 10 65 10 80 0"
        stroke="#66BFA7"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

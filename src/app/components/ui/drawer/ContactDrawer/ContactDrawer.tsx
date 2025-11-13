'use client';

import { useEffect, useState } from 'react';
import { IoCallOutline } from 'react-icons/io5';
import styles from './ContactDrawer.module.css';
import { StoreService } from '@/app/api/services/client/storeService/storeService';
import { StoreInfo } from '@/app/api/types/member/store/store';
import toast from 'react-hot-toast';

interface ContactDrawerProps {
  onClose: () => void;
  storeId: string;
}

export const ContactDrawer = ({ onClose, storeId }: ContactDrawerProps) => {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    let isMounted = true;

    const fetchStore = async () => {
      try {
        setLoading(true);
        const res = await StoreService.getStoreDetails(storeId);

        if (!isMounted) return;

        if (res.error || !res.data?.data) {
          toast.error('매장 정보를 불러오지 못했습니다.');
          setStore(null);
        } else {
          setStore(res.data.data);
        }
      } catch (error) {
        console.error('[ContactDrawer] Failed to fetch store info:', error);
        toast.error('매장 정보를 불러오지 못했습니다.');
        setStore(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStore();

    return () => {
      isMounted = false;
    };
  }, [storeId]);

  const handleCall = () => {
    if (store?.businessPhoneNumber?.trim()) {
      window.location.href = `tel:${store.businessPhoneNumber}`;
    } else {
      toast.error('전화번호가 등록되어 있지 않습니다.');
    }
  };

  const displayPhone =
    store?.businessPhoneNumber?.trim() && store.businessPhoneNumber.length > 0
      ? `통화 ${store.businessPhoneNumber}`
      : '등록된 전화번호가 없습니다.';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <button className={styles.callButton} disabled>
            <IoCallOutline size={20} className={styles.call} />
            로딩 중...
          </button>
        ) : (
          <button
            className={styles.callButton}
            onClick={handleCall}
            disabled={!store?.businessPhoneNumber}
          >
            <IoCallOutline size={20} className={styles.call} />
            {displayPhone}
          </button>
        )}

        <button className={styles.cancelButton} onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
};

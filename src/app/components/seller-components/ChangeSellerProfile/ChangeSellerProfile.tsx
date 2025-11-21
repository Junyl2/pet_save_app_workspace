'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaCamera, FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';
import styles from './ChangeSellerProfile.module.css';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import { sellerService } from '@/app/api/services/seller/serller-details/sellerService';
import { shopService } from '@/app/api/services/shops/shopService';
import {
  StoreService,
  UpdateStoreRequest,
} from '@/app/api/services/client/storeService/storeService';
import { StoreFileService } from '@/app/api/services/client/fileService/storeFileService';
import defaultProfile from '@/app/constats/defaultProfile';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';

type SellerProfile = {
  businessName: string;
  phone: string;
  openTime: string;
  closeTime: string;
  address: string;
  avatarUrl?: string;
};

type Props = {
  initial?: Partial<SellerProfile>;
  onSubmit?: (data: SellerProfile) => void;
  onBack?: () => void;
};

type StoreSummary = {
  businessName?: string;
  businessPhoneNumber?: string;
  openingHours?: string;
  closingHours?: string;
  roadAddress?: string;
  detailedAddress?: string;
  businessProfileImage?: string;
  allowPhoneInquiries?: boolean;
};

type LegacySeller = {
  name?: string;
  phoneNumber?: string;
  location?: string;
  products?: Array<{ shopImage?: string }>;
};

type ApiEnvelope<T> = {
  success?: boolean;
  status?: number;
  resultMsg?: string;
  divisionCode?: string | null;
  data?: T;
};

const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export default function ChangeSellerProfile({ initial, onSubmit }: Props) {
  const businessId = useId();
  const phoneId = useId();
  const openId = useId();
  const closeId = useId();
  const addressId = useId();

  const params = useSearchParams();

  const routeStoreId = params?.get('storeId') || null;
  const routeShopId = params?.get('shopId') || null;

  const storedSellerId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem('sellerId');
    return v || null;
  }, []);

  const storeId = routeStoreId || routeShopId || storedSellerId;

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [allowPhoneInquiries, setAllowPhoneInquiries] = useState<boolean>(true);

  const [form, setForm] = useState<SellerProfile>({
    businessName: initial?.businessName ?? 'ㅇㅇ 동물병원',
    phone: initial?.phone ?? '02-1234-5897',
    openTime: initial?.openTime ?? '09:00',
    closeTime: initial?.closeTime ?? '18:00',
    address: initial?.address ?? '서울 관악구 신림로70길 23',
    avatarUrl: initial?.avatarUrl ?? defaultProfile.image,
  });

  useEffect(() => {
    (async () => {
      try {
        if (!storeId) {
          setLoading(false);
          return;
        }

        let storeData: StoreSummary | null = null;

        try {
          const storeResponse = (await StoreService.getStoreSummary(
            storeId.toString()
          )) as unknown as { data?: ApiEnvelope<StoreSummary> };

          if (storeResponse?.data?.data) {
            storeData = storeResponse.data.data;
          }
        } catch {
          console.log('StoreSummary failed — fallback to legacy.');
        }

        let sellerData: LegacySeller | null = null;
        if (!storeData) {
          try {
            const numericStoreId = Number(storeId);
            if (Number.isFinite(numericStoreId)) {
              const legacyRes = (await sellerService.getSellerDetailsByShopId(
                numericStoreId
              )) as unknown as LegacySeller | null;
              sellerData = legacyRes ?? null;
            }
          } catch {
            console.log('Legacy seller also failed.');
          }
        }

        const lsKey = `seller:profile:${storeId}`;
        const saved =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(lsKey)
            : null;
        const override: Partial<SellerProfile> = saved ? JSON.parse(saved) : {};

        const mapped: SellerProfile = {
          businessName:
            storeData?.businessName ||
            sellerData?.name ||
            override.businessName ||
            '업체명',
          phone:
            storeData?.businessPhoneNumber ||
            sellerData?.phoneNumber ||
            override.phone ||
            '',
          openTime: storeData?.openingHours || override.openTime || '09:00',
          closeTime: storeData?.closingHours || override.closeTime || '18:00',
          address:
            storeData?.roadAddress && storeData?.detailedAddress
              ? `${storeData.roadAddress} ${storeData.detailedAddress}`
              : storeData?.roadAddress ||
                storeData?.detailedAddress ||
                sellerData?.location ||
                override.address ||
                '',
          avatarUrl:
            storeData?.businessProfileImage ??
            sellerData?.products?.[0]?.shopImage ??
            override.avatarUrl ??
            defaultProfile.image,
        };

        setForm(mapped);

        // Load allowPhoneInquiries
        if (storeData?.allowPhoneInquiries !== undefined) {
          setAllowPhoneInquiries(storeData.allowPhoneInquiries);
        } else {
          setAllowPhoneInquiries(true);
        }
      } catch (error) {
        console.error('Error loading seller profile:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId]);

  const handleChange =
    (key: keyof SellerProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
    };

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const uploadResponse = await StoreFileService.uploadFile({
        file,
        metadata: {
          entityType: 'store',
          documentType: 'PROFILE_IMAGE',
        },
      });

      if (uploadResponse.error) {
        setToastMessage('파일 업로드에 실패했습니다.');
        setShowToast(true);
        return;
      }

      if (uploadResponse.data?.data?.encryptedId) {
        setUploadedFileId(uploadResponse.data.data.encryptedId);
        setForm((p) => ({
          ...p,
          avatarUrl: uploadResponse.data?.data?.url || p.avatarUrl,
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      e.currentTarget.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId) return;

    setIsUpdating(true);

    try {
      const addressParts = form.address.split(' ');
      const roadAddress = addressParts.slice(0, -1).join(' ') || form.address;
      const detailedAddress = addressParts[addressParts.length - 1] || '';

      const updateData: UpdateStoreRequest = {
        businessName: form.businessName,
        roadAddress,
        detailedAddress,
        zipCode: '00000',
        businessPhoneNumber: form.phone,
        allowPhoneInquiries,
        businessOpeningTime: `${form.openTime}:00`,
        businessClosingTime: `${form.closeTime}:00`,
        businessLogoFileId: uploadedFileId || undefined,
      };

      const response = await StoreService.updateStore(storeId, updateData);

      if (response.error) {
        console.error('Update failed:', response.error);
        return;
      }

      localStorage.setItem(`seller:profile:${storeId}`, JSON.stringify(form));

      try {
        const numericStoreId = Number(storeId);
        if (Number.isFinite(numericStoreId)) {
          shopService.updateShop(numericStoreId, {
            name: form.businessName,
            phoneNumber: form.phone,
            location: form.address,
            shopName: form.businessName,
            shopLocation: form.address,
          });
        }
      } catch {}

      onSubmit?.(form);
      setToastMessage('업체 정보가 성공적으로 업데이트되었습니다.');
      setShowToast(true);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <>
        <ProductHeader />
        <div className={styles.wrap} style={{ padding: 16 }}>
          불러오는 중...
        </div>
      </>
    );
  }

  return (
    <>
      <ProductHeader />
      <div className={styles.wrap}>
        {/* Profile Header */}
        <section className={styles.profileCard}>
          <div className={styles.avatarWrap}>
            <img src={form.avatarUrl} alt="프로필" className={styles.avatar} />
          </div>

          <label htmlFor="avatar" className={styles.changePhotoBtn}>
            <FaCamera className={styles.cameraIcon} />
            <span>{isUploading ? '업로드 중...' : '프로필 사진 변경'}</span>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarPick}
              disabled={isUploading}
              className={styles.hiddenFile}
            />
          </label>
        </section>

        <form className={styles.form} onSubmit={submit}>
          {/* 업체명 */}
          <div className={styles.field}>
            <label htmlFor={businessId} className={styles.label}>
              업체명
            </label>
            <input
              id={businessId}
              className={styles.input}
              value={form.businessName}
              onChange={handleChange('businessName')}
            />
          </div>

          {/* 전화번호 */}
          <div className={styles.field}>
            <label htmlFor={phoneId} className={styles.label}>
              전화번호
            </label>
            <input
              id={phoneId}
              className={styles.input}
              value={form.phone}
              onChange={handleChange('phone')}
            />
          </div>

          {/* NEW — 전화문의 활성화 UI (Figma) */}
          <div className={styles.phoneInquiryWrap}>
            <div className={styles.phoneInquiryHeader}>
              <div className={styles.phoneInquiryTitle}>전화문의 활성화</div>
              <div className={styles.phoneInquiryDesc}>
                앱 내 전화문의를 활성화합니다.
              </div>
            </div>

            <div className={styles.phoneInquiryButtons}>
              {/* 공개 */}
              <div
                className={
                  allowPhoneInquiries
                    ? styles.phoneBtnActiveGreen
                    : styles.phoneBtnInactive
                }
                onClick={() => setAllowPhoneInquiries(true)}
              >
                <Image
                  src={
                    allowPhoneInquiries
                      ? '/images/icons/active-call.svg'
                      : '/images/icons/call.svg'
                  }
                  alt="call"
                  width={16}
                  height={16}
                />
                <span
                  className={
                    allowPhoneInquiries
                      ? styles.phoneTextWhite
                      : styles.phoneTextInactive
                  }
                >
                  공개
                </span>
              </div>

              {/* 비공개 */}
              <div
                className={
                  !allowPhoneInquiries
                    ? styles.phoneBtnActiveGreen
                    : styles.phoneBtnInactive
                }
                onClick={() => setAllowPhoneInquiries(false)}
              >
                <Image
                  src={
                    !allowPhoneInquiries
                      ? '/images/icons/lock.png'
                      : '/images/icons/inactive-lock.png'
                  }
                  alt="lock"
                  width={16}
                  height={16}
                />
                <span
                  className={
                    !allowPhoneInquiries
                      ? styles.phoneTextWhite
                      : styles.phoneTextInactive
                  }
                >
                  비공개
                </span>
              </div>
            </div>
          </div>

          {/* 영업 시간 */}
          <div className={styles.field}>
            <div className={styles.label}>영업 시간</div>
            <div className={styles.timeRow}>
              <div className={styles.timeCol}>
                <label htmlFor={openId} className={styles.timeLabel}>
                  오픈
                </label>
                <div className={styles.selectWrap}>
                  <select
                    id={openId}
                    className={styles.select}
                    value={form.openTime}
                    onChange={handleChange('openTime')}
                  >
                    {timeOptions.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <FaChevronDown className={styles.chevron} />
                </div>
              </div>
              <div className={styles.timeCol}>
                <label htmlFor={closeId} className={styles.timeLabel}>
                  마감
                </label>
                <div className={styles.selectWrap}>
                  <select
                    id={closeId}
                    className={styles.select}
                    value={form.closeTime}
                    onChange={handleChange('closeTime')}
                  >
                    {timeOptions.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <FaChevronDown className={styles.chevron} />
                </div>
              </div>
            </div>
          </div>

          {/* 위치 */}
          <div className={styles.field}>
            <label htmlFor={addressId} className={styles.label}>
              위치
            </label>
            <input
              id={addressId}
              className={`${styles.input} ${styles.addressInput}`}
              value={form.address}
              onChange={handleChange('address')}
            />
          </div>

          <div className={styles.ctaBar}>
            <button
              type="submit"
              className={styles.ctaBtn}
              disabled={isUpdating || isUploading}
            >
              {isUpdating ? '업데이트 중...' : '수정 완료하기'}
            </button>
          </div>
        </form>
      </div>

      {showToast && (
        <ToastMessage
          message={toastMessage}
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </>
  );
}

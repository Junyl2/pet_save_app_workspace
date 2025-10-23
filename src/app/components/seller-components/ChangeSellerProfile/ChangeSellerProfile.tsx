'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaCamera, FaChevronDown } from 'react-icons/fa';
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

// util: file -> dataURL (persistable)
/* const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  }); */

export default function ChangeSellerProfile({
  initial,
  onSubmit,
}: /*   onBack, */
Props) {
  const businessId = useId();
  const phoneId = useId();
  const openId = useId();
  const closeId = useId();
  const addressId = useId();

  const params = useSearchParams();

  // 1) identify which shop/owner we're editing
  const routeStoreId = params?.get('storeId') || null;
  const routeShopId = params?.get('shopId') || null; // Keep for backward compatibility
  const storedSellerId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem('sellerId');
    return v || null;
  }, []);

  // prefer route ?storeId=... or ?shopId=...; fallback to local sellerId
  const storeId = routeStoreId || routeShopId || storedSellerId;

  console.log('ChangeSellerProfile - Store ID resolution:', {
    routeStoreId,
    routeShopId,
    storedSellerId,
    finalStoreId: storeId,
  });

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState<SellerProfile>({
    businessName: initial?.businessName ?? 'ㅇㅇ 동물병원',
    phone: initial?.phone ?? '02-1234-5897',
    openTime: initial?.openTime ?? '09:00',
    closeTime: initial?.closeTime ?? '18:00',
    address: initial?.address ?? '서울 관악구 신림로70길 23',
    avatarUrl: initial?.avatarUrl ?? defaultProfile.image,
  });

  // 2) load existing data for this shop/owner + any saved overrides
  useEffect(() => {
    (async () => {
      try {
        if (!storeId) {
          setLoading(false);
          return;
        }

        // Try to get store data from the new API first
        let storeData: StoreSummary | null = null;
        try {
          if (storeId !== null) {
            const storeResponse = (await StoreService.getStoreSummary(
              storeId.toString()
            )) as unknown as { data?: ApiEnvelope<StoreSummary> };

            if (storeResponse?.data?.data) {
              storeData = storeResponse.data.data;
              console.log('Store data loaded:', storeData);
              console.log('Business name from API:', storeData.businessName);
              console.log('Phone from API:', storeData.businessPhoneNumber);
              console.log('Opening hours from API:', storeData.openingHours);
              console.log('Closing hours from API:', storeData.closingHours);
              console.log(
                'Address from API:',
                storeData.roadAddress,
                storeData.detailedAddress
              );
            }
          }
        } catch {
          console.log(
            'Store API not available, falling back to seller service'
          );
        }

        // Fallback to existing seller service if store API fails
        let sellerData: LegacySeller | null = null;
        if (!storeData) {
          try {
            // Try to convert to number for the legacy seller service
            const numericStoreId = Number(storeId);
            if (Number.isFinite(numericStoreId)) {
              const legacyRes = (await sellerService.getSellerDetailsByShopId(
                numericStoreId
              )) as unknown as LegacySeller | null;
              sellerData = legacyRes ?? null;
            }
          } catch {
            console.log('Seller service also failed, using defaults');
          }
        }

        // load overrides from localStorage if any
        const lsKey = `seller:profile:${storeId}`;
        const saved =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(lsKey)
            : null;

        const override: Partial<SellerProfile> = saved ? JSON.parse(saved) : {};
        console.log('LocalStorage override data:', override);

        // Map data from store API or fallback to seller service
        // Priority: API data first, then localStorage overrides, then fallbacks
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
          openTime: storeData?.closingHours || override.openTime || '09:00',
          closeTime: storeData?.openingHours || override.closeTime || '18:00',
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

        console.log('Mapped form data:', mapped);
        setForm(mapped);
      } catch (error) {
        console.error('Error loading seller profile data:', error);
        // fall back to defaults silently
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
      console.log('[ChangeSellerProfile] Uploading file:', file.name);

      // Upload file using StoreFileService
      const uploadResponse = await StoreFileService.uploadFile({
        file,
        metadata: {
          entityType: 'store',
          documentType: 'PROFILE_IMAGE',
        },
      });

      if (uploadResponse.error) {
        console.error(
          '[ChangeSellerProfile] File upload failed:',
          uploadResponse.error
        );
        setToastMessage('파일 업로드에 실패했습니다. 다시 시도해주세요.');
        setShowToast(true);
        return;
      }

      if (uploadResponse.data?.data?.encryptedId) {
        console.log(
          '[ChangeSellerProfile] File uploaded successfully:',
          uploadResponse.data.data.encryptedId
        );
        setUploadedFileId(uploadResponse.data.data.encryptedId);

        // Update the form with the new image URL for preview
        setForm((p) => ({
          ...p,
          avatarUrl: uploadResponse.data?.data?.url || p.avatarUrl,
        }));
      }
    } catch (error) {
      console.error('[ChangeSellerProfile] File upload error:', error);
    } finally {
      setIsUploading(false);
      e.currentTarget.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId) {
      console.error('No store ID available for update');
      return;
    }

    setIsUpdating(true);

    try {
      // Parse address to separate road address and detailed address
      const addressParts = form.address.split(' ');
      const roadAddress = addressParts.slice(0, -1).join(' ') || form.address;
      const detailedAddress = addressParts[addressParts.length - 1] || '';

      // Prepare update data for the API
      // Note: API field names are swapped, so we need to send them in reverse
      const updateData: UpdateStoreRequest = {
        businessName: form.businessName,
        roadAddress: roadAddress,
        detailedAddress: detailedAddress,
        zipCode: '00000', // Default zip code - you might want to make this configurable
        businessPhoneNumber: form.phone,
        allowPhoneInquiries: true, // Default to true - you might want to make this configurable
        businessOpeningTime: `${form.closeTime}:00`, // Send closeTime as openingHours (API field swap)
        businessClosingTime: `${form.openTime}:00`, // Send openTime as closingHours (API field swap)
        businessLogoFileId: uploadedFileId || undefined, // Include uploaded file ID if available
      };

      console.log('Updating store with data:', updateData);
      console.log('Form times debug:', {
        formOpenTime: form.openTime,
        formCloseTime: form.closeTime,
        sentAsOpeningTime: `${form.closeTime}:00`,
        sentAsClosingTime: `${form.openTime}:00`,
      });

      // Call the new API to update store information
      const response = await StoreService.updateStore(storeId, updateData);

      if (response.error) {
        console.error('Failed to update store:', response.error);
        console.error('Request data that failed:', updateData);
        // You might want to show an error message to the user here
        return;
      }

      console.log('Store updated successfully:', response.data);

      // Persist for THIS owner/shop in localStorage as backup
      const lsKey = `seller:profile:${storeId}`;
      localStorage.setItem(lsKey, JSON.stringify(form));

      // Also sync basic fields to mock shop service (so lists reflect it)
      try {
        const numericStoreId = Number(storeId);
        if (Number.isFinite(numericStoreId)) {
          shopService.updateShop(numericStoreId, {
            name: form.businessName,
            phoneNumber: form.phone,
            location: form.address,
            shopName: form.businessName,
            shopLocation: form.address,
            // you can add a field in your Shop type for avatar if desired
            // image: form.avatarUrl,
          });
        }
      } catch {
        // ignore in mock
      }

      onSubmit?.(form);
      console.log('Form submitted successfully:', form);

      // Show success toast
      setToastMessage('업체 정보가 성공적으로 업데이트되었습니다.');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating store:', error);
      // You might want to show an error message to the user here
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

// /client/seller/pages/change-profile/page.tsx
'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCamera, FaChevronDown } from 'react-icons/fa';
import styles from './ChangeSellerProfile.module.css';
import { ProductHeader } from '../../sections/ProductDetails/Header/ProductHeader';
import { sellerService } from '@/app/api/services/seller/serller-details/sellerService';
import { shopService } from '@/app/api/services/shops/shopService';

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

const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

// util: file -> dataURL (persistable)
const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

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

  const router = useRouter();
  const params = useSearchParams();

  // 1) identify which shop/owner we’re editing
  const routeShopId = Number(params?.get('shopId') || NaN);
  const storedSellerId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const v = Number(window.localStorage.getItem('sellerId'));
    return Number.isFinite(v) ? v : null;
  }, []);

  // prefer route ?shopId=...; fallback to local sellerId
  const shopId = Number.isFinite(routeShopId)
    ? routeShopId
    : storedSellerId ?? null;

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<SellerProfile>({
    businessName: initial?.businessName ?? 'ㅇㅇ 동물병원',
    phone: initial?.phone ?? '02-1234-5897',
    openTime: initial?.openTime ?? '09:00',
    closeTime: initial?.closeTime ?? '18:00',
    address: initial?.address ?? '서울 관악구 신림로70길 23',
    avatarUrl:
      initial?.avatarUrl ??
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop',
  });

  // 2) load existing data for this shop/owner + any saved overrides
  useEffect(() => {
    (async () => {
      try {
        if (!Number.isFinite(Number(shopId))) {
          setLoading(false);
          return;
        }

        const seller = await sellerService.getSellerDetailsByShopId(
          Number(shopId)
        );

        // load overrides from localStorage if any
        const lsKey = `seller:profile:${shopId}`;
        const saved =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(lsKey)
            : null;

        const override: Partial<SellerProfile> = saved ? JSON.parse(saved) : {};

        const mapped: SellerProfile = {
          businessName: override.businessName ?? seller.name ?? '업체명',
          phone: override.phone ?? seller.phoneNumber ?? '',
          openTime: override.openTime ?? '09:00',
          closeTime: override.closeTime ?? '18:00',
          address: override.address ?? seller.location ?? '',
          avatarUrl:
            override.avatarUrl ??
            seller.products?.[0]?.shopImage ??
            form.avatarUrl,
        };

        setForm(mapped);
      } catch {
        // fall back to defaults silently
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  const handleChange =
    (key: keyof SellerProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
    };

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // persistable data url
    const dataUrl = await fileToDataUrl(file);
    setForm((p) => ({ ...p, avatarUrl: dataUrl }));
    e.currentTarget.value = '';
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // persist for THIS owner/shop
    if (Number.isFinite(Number(shopId))) {
      const lsKey = `seller:profile:${shopId}`;
      localStorage.setItem(lsKey, JSON.stringify(form));

      // also sync basic fields to mock shop service (so lists reflect it)
      try {
        shopService.updateShop(Number(shopId), {
          name: form.businessName,
          phoneNumber: form.phone,
          location: form.address,
          shopName: form.businessName,
          shopLocation: form.address,
          // you can add a field in your Shop type for avatar if desired
          // image: form.avatarUrl,
        });
      } catch {
        // ignore in mock
      }
    }

    onSubmit?.(form);
    console.log('Form submitted:', form);

    // go back to seller details (optional UX)
    if (Number.isFinite(Number(shopId))) {
      router.push(`/seller-details/${shopId}`);
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
            <span>프로필 사진 변경</span>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarPick}
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
              className={styles.input}
              value={form.address}
              onChange={handleChange('address')}
            />
          </div>

          <div className={styles.ctaBar}>
            <button type="submit" className={styles.ctaBtn}>
              수정 완료하기
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

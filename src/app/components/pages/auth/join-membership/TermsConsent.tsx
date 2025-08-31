'use client';
import { useState } from 'react';
import styles from './TermsConsent.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';

type CheckboxKey =
  | 'all'
  | 'service'
  | 'privacy'
  | 'efinance'
  | 'refund'
  | 'location'
  | 'marketing';

type TermsConsentPayload = {
  service: boolean;
  privacy: boolean;
  efinance: boolean;
  refund: boolean;
  location: boolean;
  marketing: boolean;
};

export default function TermsConsent() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<CheckboxKey, boolean>>({
    all: false,
    service: false,
    privacy: false,
    efinance: false,
    refund: false,
    location: false,
    marketing: false,
  });

  const handleCheck = (key: CheckboxKey) => {
    if (key === 'all') {
      const newState: Record<CheckboxKey, boolean> = {
        all: !checked.all,
        service: !checked.all,
        privacy: !checked.all,
        efinance: !checked.all,
        refund: !checked.all,
        location: !checked.all,
        marketing: !checked.all,
      };
      setChecked(newState);
    } else {
      setChecked((prev) => {
        const updated = { ...prev, [key]: !prev[key] };
        updated.all =
          updated.service &&
          updated.privacy &&
          updated.efinance &&
          updated.refund &&
          updated.location &&
          updated.marketing;
        return updated;
      });
    }
  };

  const isAnyChecked = Object.entries(checked)
    .filter(([key]) => key !== 'all')
    .some(([_, value]) => value);

  const handleSubmit = async () => {
    const payload: TermsConsentPayload = {
      service: checked.service,
      privacy: checked.privacy,
      efinance: checked.efinance,
      refund: checked.refund,
      location: checked.location,
      marketing: checked.marketing,
    };

    try {
      // Will Replace this with real API call
      // await axios.post('/api/terms-consent', payload);
      console.log('Submitting terms consent:', payload);

      router.push('/client/join-membership/membership-information');
    } catch (error) {
      console.error('Failed to submit terms consent', error);
      alert('약관 동의 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
        >
          <FaChevronLeft className={styles.backIcon} />
        </button>
        <h1 className={styles.headerTitle}>회원가입</h1>
      </div>

      {/* main content */}
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Image
            src="/images/logo/pet-saves.png"
            alt="Pet Save Logo"
            height={110}
            width={165}
          />
        </div>

        {/* Title & Description */}
        <h1 className={styles.title}>
          Pet Save 서비스 이용을 위해 아래의 약관에 동의해주세요.
        </h1>
        <p className={styles.description}>
          선택항목에 동의하지 않으셔도 펫세이브의 서비스를 이용할 수 있습니다.{' '}
          <br />
          펫세이브에서 제공하는 다양한 혜택과 소식을 받으시려면 선택항목에
          체크해 주세요.
        </p>

        {/* Checkboxes */}
        <div className={styles.checkboxes}>
          {/* Header */}
          <div
            className={`${styles.checkboxRow} ${
              checked.all ? styles.checkedHeader : styles.headerRow
            }`}
            onClick={() => handleCheck('all')}
          >
            <label className={styles.selectAllLabel}>전체 동의</label>
            <input
              type="checkbox"
              checked={checked.all}
              onChange={() => handleCheck('all')}
              className={styles.checkboxLabel}
            />
          </div>

          {/* Individual Checkboxes */}
          {[
            { key: 'service', label: '서비스 이용 약관 동의 (필수)' },
            { key: 'privacy', label: '개인정보 수집 및 이용 동의 (필수)' },
            { key: 'efinance', label: '전자금융거래 이용 약관 동의 (필수)' },
            { key: 'refund', label: '환불 및 취소 정책 안내 확인 (필수)' },
            {
              key: 'location',
              label: '위치 정보 서비스 이용 약관 동의 (선택)',
            },
            { key: 'marketing', label: '광고/마케팅 정보 수신 동의 (선택)' },
          ].map((item) => (
            <div key={item.key} className={styles.checkboxRow}>
              <label>{item.label}</label>
              <input
                type="checkbox"
                checked={checked[item.key as CheckboxKey]}
                onChange={() => handleCheck(item.key as CheckboxKey)}
                className={styles.checkbox}
              />
            </div>
          ))}
        </div>

        {/* Bottom Button */}
        <button
          type="button"
          className={`${styles.bottomButton} ${
            isAnyChecked ? styles.enabled : ''
          }`}
          disabled={!isAnyChecked}
          onClick={handleSubmit}
        >
          다음
        </button>
      </div>
    </>
  );
}

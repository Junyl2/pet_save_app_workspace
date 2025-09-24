'use client';
import { PAGE_URLS } from '@/app/utils/page_url';
import { useRouter } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import styles from './TermsAndConditions.module.css';

interface PolicyItem {
  id: string;
  title: string;
  path: string;
}

export default function TermsAndConditionsPage() {
  const router = useRouter();

  const policyItems: PolicyItem[] = [
    {
      id: 'service-terms',
      title: '서비스 이용약관',
      path: PAGE_URLS.TERMS_SERVICE
    },
    {
      id: 'privacy-policy',
      title: '개인정보 수집 및 이용 동의',
      path: PAGE_URLS.TERMS_PRIVACY
    },
    {
      id: 'location-terms',
      title: '전자금융거래 이용 약관',
      path: PAGE_URLS.TERMS_FINANCIAL
    },
    {
      id: 'marketing-policy',
      title: '환불/취소/교환 정책',
      path: PAGE_URLS.TERMS_REFUND
    },
    {
      id: 'location-service',
      title: '위치정보 서비스 이용 약관',
      path: PAGE_URLS.TERMS_LOCATION
    },
    {
      id: 'marketing-consent',
      title: '광고/마케팅 정보 수신 동의',
      path: PAGE_URLS.TERMS_MARKETING
    }
  ];

  const handlePolicyClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <ProductHeader />

      {/* Policy List */}
      <div className={styles.policyList}>
        {policyItems.map((item) => (
          <button
            key={item.id}
            className={styles.policyItem}
            onClick={() => handlePolicyClick(item.path)}
          >
            <span className={styles.policyTitle}>{item.title}</span>
            <FaChevronRight className={styles.chevronIcon} />
          </button>
        ))}
      </div>
    </div>
  );
}

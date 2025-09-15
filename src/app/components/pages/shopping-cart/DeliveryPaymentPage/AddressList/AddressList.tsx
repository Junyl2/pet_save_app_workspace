'use client';

import styles from './AddressList.module.css';
import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

type Address = {
  id: number;
  label: string;
  name: string;
  postalCode: string;
  address: string;
};

const initialAddresses: Address[] = [
  {
    id: 1,
    label: '기본 배송지',
    name: '펫세이브',
    postalCode: '04580',
    address: '서울특별시 중구 왕십리로 407 5층',
  },
  {
    id: 2,
    label: '회사',
    name: '김민준',
    postalCode: '06134',
    address: '서울특별시 강남구 테헤란로 152 강남파이낸스센터 21층',
  },
  {
    id: 3,
    label: '부모님 댁',
    name: '박서연',
    postalCode: '48058',
    address: '부산광역시 해운대구 마린시티2로 33 두산위브더제니스 101동 2504호',
  },
  {
    id: 4,
    label: '제주도 별장',
    name: '이도현',
    postalCode: '63564',
    address: '제주특별자치도 서귀포시 안덕면 신화역사로304번길 38',
  },
  {
    id: 5,
    label: '친구 집',
    name: '최지우',
    postalCode: '22005',
    address: '인천광역시 연수구 컨벤시아대로 165 송도힐스테이트 402동 1101호',
  },
];

export default function AddressList() {
  const [addresses] = useState<Address[]>(initialAddresses);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [defaultId, setDefaultId] = useState<number>(1);

  const router = useRouter();

  /*  const selectedLabel = useMemo(
    () => addresses.find((a) => a.id === selectedId)?.label ?? '',
    [addresses, selectedId]
  ); */

  // Custom toast with 확인 button
  const showConfirmToast = (message: string) => {
    toast.success(
      (t) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <span>{message}</span>
          <button
            style={{
              marginLeft: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              color: '#fff',
            }}
            onClick={() => toast.dismiss(t.id)}
          >
            확인
          </button>
        </div>
      ),
      {
        position: 'bottom-center',
      }
    );
  };

  const handleAddAddress = () => {
    showConfirmToast('배송지가 변경 되었습니다.');
  };

  const handleSetDefault = () => {
    if (!selectedId) return;
    setDefaultId(selectedId);
    showConfirmToast('기본 배송지가 변경 되었습니다.');
  };

  return (
    <div className={styles.container}>
      {/*  Fixed top bar */}
      <div className={styles.topBar}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <FiArrowLeft size={24} />
        </button>
        <h2 className={styles.topBarTitle}>배송지 목록</h2>
      </div>

      <Toaster
        position="bottom-center"
        gutter={8}
        containerStyle={{
          inset: 'auto 0 calc(16px + env(safe-area-inset-bottom)) 0',
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 2800,
          style: {
            background: '#2F6F5E',
            color: '#fff',
            borderRadius: '5px',
            marginBottom: '78px',
            width: '100%',
          },
          success: {
            iconTheme: {
              primary: '#2F6F5E',
              secondary: '#2F6F5E',
            },
          },
        }}
      />

      {/*   {selectedId && (
        <div className={styles.selectedLabel}>
          선택된 배송지: <strong>{selectedLabel}</strong>
        </div>
      )}
 */}
      {addresses.map((addr) => (
        <div key={addr.id} className={styles.card}>
          <label className={styles.radioWrapper}>
            <input
              type="radio"
              name="address"
              checked={selectedId === addr.id}
              onChange={() => setSelectedId(addr.id)}
            />
            <span className={styles.customRadio}></span>
          </label>

          <div className={styles.cardContent}>
            <h3
              className={`${styles.label} ${
                selectedId === addr.id ? styles.labelSelected : ''
              }`}
            >
              {addr.label}
              {defaultId === addr.id && (
                <span className={styles.defaultBadge}>기본</span>
              )}
            </h3>
            <p className={styles.name}>{addr.name}</p>
            <p className={styles.postal}>({addr.postalCode})</p>
            <p className={styles.address}>{addr.address}</p>
            <div className={styles.editBtnContainer}>
              <button className={styles.editBtn}>수정하기</button>
            </div>
          </div>
        </div>
      ))}

      {/* Fixed bottom action bar */}
      <div className={styles.bottomBar}>
        <button className={styles.btnOutline} onClick={handleAddAddress}>
          배송지 추가
        </button>
        <button
          className={styles.btnPrimary}
          onClick={handleSetDefault}
          disabled={!selectedId}
        >
          기본 배송지로 설정
        </button>
      </div>
    </div>
  );
}

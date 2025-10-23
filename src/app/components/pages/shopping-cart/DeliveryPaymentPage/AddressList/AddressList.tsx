'use client';

import styles from './AddressList.module.css';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { DeliveryAddressService } from '@/app/api/services/client/memberService/member-information/deliveryAddressService';
import type { DeliveryAddress } from '@/app/api/types/member/member-information/member-information';

export default function AddressList() {
  const [apiAddresses, setApiAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [defaultId, setDefaultId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    zipCode: '',
    roadAddress: '',
    detailedAddress: '',
    default: false,
  });
  const [newAddressForm, setNewAddressForm] = useState({
    zipCode: '',
    roadAddress: '',
    detailedAddress: '',
    default: false,
  });

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
    setIsAddingNew(true);
    setNewAddressForm({
      zipCode: '',
      roadAddress: '',
      detailedAddress: '',
      default: false,
    });
  };

  const handleSetDefault = async () => {
    if (!selectedId) return;
    const selected = apiAddresses.find(
      (a) => a.deliveryAddressId === selectedId
    );
    if (!selected) return;
    try {
      setIsSaving(true);
      const response = await DeliveryAddressService.updateDeliveryAddress(
        selectedId,
        {
          roadAddress: selected.roadAddress,
          detailedAddress: selected.detailedAddress,
          zipCode: selected.zipCode,
          isDefault: true,
        }
      );
      if (response?.data?.success) {
        setApiAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            default: a.deliveryAddressId === selectedId,
          }))
        );
        setDefaultId(selectedId);
        showConfirmToast('기본 배송지가 설정되었습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAddress = (addressId: string) => {
    const address = apiAddresses.find((a) => a.deliveryAddressId === addressId);
    if (!address) return;
    setEditingId(addressId);
    setEditForm({
      zipCode: address.zipCode || '',
      roadAddress: address.roadAddress || '',
      detailedAddress: address.detailedAddress || '',
      default: !!address.default,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      zipCode: '',
      roadAddress: '',
      detailedAddress: '',
      default: false,
    });
  };

  const handleEditFormChange = (field: string, value: string | boolean) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      setIsSaving(true);
      const response = await DeliveryAddressService.updateDeliveryAddress(
        editingId,
        {
          roadAddress: editForm.roadAddress,
          detailedAddress: editForm.detailedAddress,
          zipCode: editForm.zipCode,
          isDefault: editForm.default,
        }
      );
      if (response?.data?.success) {
        setApiAddresses((prev) =>
          prev.map((a) =>
            a.deliveryAddressId === editingId
              ? {
                  ...a,
                  roadAddress: editForm.roadAddress,
                  detailedAddress: editForm.detailedAddress,
                  zipCode: editForm.zipCode,
                  default: editForm.default,
                }
              : a
          )
        );
        if (editForm.default) setDefaultId(editingId);
        setEditingId(null);
        showConfirmToast('배송지가 수정되었습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewAddressForm({
      zipCode: '',
      roadAddress: '',
      detailedAddress: '',
      default: false,
    });
  };

  const handleNewAddressFormChange = (
    field: string,
    value: string | boolean
  ) => {
    setNewAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNewAddress = async () => {
    try {
      setIsSaving(true);
      const response = await DeliveryAddressService.createDeliveryAddress({
        roadAddress: newAddressForm.roadAddress,
        detailedAddress: newAddressForm.detailedAddress,
        zipCode: newAddressForm.zipCode,
        default: newAddressForm.default,
      });
      if (response?.data?.success && response.data.data) {
        const created = response.data.data as DeliveryAddress;
        setApiAddresses((prev) => [...prev, created]);
        if (created.default) {
          setDefaultId(created.deliveryAddressId);
          setSelectedId(created.deliveryAddressId);
        }
        setIsAddingNew(false);
        showConfirmToast('배송지가 추가되었습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await DeliveryAddressService.getDeliveryAddresses();
        if (response?.data?.success && Array.isArray(response.data.data)) {
          const list = response.data.data;
          setApiAddresses(list);
          const defaultAddr = list.find((a) => a.default);
          if (defaultAddr) {
            setDefaultId(defaultAddr.deliveryAddressId);
            setSelectedId(defaultAddr.deliveryAddressId);
          } else if (list.length > 0) {
            setSelectedId(list[0].deliveryAddressId);
          }
        } else {
          setApiAddresses([]);
        }
      } catch {
        setApiAddresses([]);
      }
    };
    fetchAddresses();
  }, []);

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
      {apiAddresses.map((api) => {
        const postal = api.zipCode;
        const fullAddress = `${api.roadAddress} ${api.detailedAddress}`.trim();
        return (
          <div key={api.deliveryAddressId} className={styles.card}>
            {editingId === api.deliveryAddressId ? (
              <div className={styles.cardContent}>
                <h3 className={styles.label}>배송지 수정</h3>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>우편번호</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editForm.zipCode}
                    onChange={(e) =>
                      handleEditFormChange('zipCode', e.target.value)
                    }
                    placeholder="12345"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>주소</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editForm.roadAddress}
                    onChange={(e) =>
                      handleEditFormChange('roadAddress', e.target.value)
                    }
                    placeholder="도로명 주소"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>상세 주소</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editForm.detailedAddress}
                    onChange={(e) =>
                      handleEditFormChange('detailedAddress', e.target.value)
                    }
                    placeholder="동/호수, 건물명 등"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editForm.default}
                      onChange={(e) =>
                        handleEditFormChange('default', e.target.checked)
                      }
                      className={styles.checkbox}
                    />
                    기본 배송지로 설정
                  </label>
                </div>
                <div className={styles.editBtnContainer}>
                  <button
                    className={styles.btnOutline}
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    취소
                  </button>
                  <button
                    className={styles.btnPrimary}
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <label className={styles.radioWrapper}>
                  <input
                    type="radio"
                    name="address"
                    checked={selectedId === api.deliveryAddressId}
                    onChange={() => setSelectedId(api.deliveryAddressId)}
                  />
                  <span className={styles.customRadio}></span>
                </label>
                <div className={styles.cardContent}>
                  <h3
                    className={`${styles.label} ${
                      selectedId === api.deliveryAddressId
                        ? styles.labelSelected
                        : ''
                    }`}
                  >
                    배송지 (temporary)
                    {defaultId === api.deliveryAddressId && (
                      <span className={styles.defaultBadge}>기본</span>
                    )}
                  </h3>
                  <p className={styles.name}>펫세이브 (temporary)</p>
                  <p className={styles.postal}>({postal})</p>
                  <p className={styles.address}>{fullAddress}</p>
                  <div className={styles.editBtnContainer}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEditAddress(api.deliveryAddressId)}
                    >
                      수정하기
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Fixed bottom action bar */}
      <div className={styles.bottomBar}>
        {isAddingNew ? (
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.label}>새 배송지 추가</h3>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>우편번호</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newAddressForm.zipCode}
                  onChange={(e) =>
                    handleNewAddressFormChange('zipCode', e.target.value)
                  }
                  placeholder="12345"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>주소</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newAddressForm.roadAddress}
                  onChange={(e) =>
                    handleNewAddressFormChange('roadAddress', e.target.value)
                  }
                  placeholder="도로명 주소"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>상세 주소</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newAddressForm.detailedAddress}
                  onChange={(e) =>
                    handleNewAddressFormChange(
                      'detailedAddress',
                      e.target.value
                    )
                  }
                  placeholder="동/호수, 건물명 등"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={newAddressForm.default}
                    onChange={(e) =>
                      handleNewAddressFormChange('default', e.target.checked)
                    }
                    className={styles.checkbox}
                  />
                  기본 배송지로 설정
                </label>
              </div>
              <div className={styles.editBtnContainer}>
                <button
                  className={styles.btnOutline}
                  onClick={handleCancelAdd}
                  disabled={isSaving}
                >
                  취소
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleSaveNewAddress}
                  disabled={isSaving}
                >
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button className={styles.btnOutline} onClick={handleAddAddress}>
            배송지 추가
          </button>
        )}
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

'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronRight, FaPlus } from 'react-icons/fa';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { DeliveryAddressService } from '@/app/api/services/client/memberService/member-information/deliveryAddressService';
import {
  DeliveryAddress,
  CreateDeliveryAddressRequest,
  UpdateDeliveryAddressRequest,
} from '@/app/api/types/member/member-information/member-information';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import Loading from '@/app/components/ui/Loading/Loading';
import styles from './DeliveryAddress.module.css';

export default function DeliveryAddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    zipCode: '',
    roadAddress: '',
    detailedAddress: '',
    default: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Add new address state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    zipCode: '',
    roadAddress: '',
    detailedAddress: '',
    default: false,
  });

  // Ref for scrolling to the add form
  const addFormRef = useRef<HTMLDivElement>(null);

  // Fetch delivery addresses
  useEffect(() => {
    const fetchDeliveryAddresses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await DeliveryAddressService.getDeliveryAddresses();

        if (response.error) {
          console.error('Failed to fetch delivery addresses:', response.error);
          setError('배송지 정보를 불러오는데 실패했습니다.');
          return;
        }

        if (response.data?.success && response.data?.data) {
          const addressList = response.data.data;
          setAddresses(addressList);

          // Set the default address as selected
          const defaultAddress = addressList.find((addr) => addr.default);
          if (defaultAddress) {
            setSelectedId(defaultAddress.deliveryAddressId);
          }
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error('Error fetching delivery addresses:', err);
        setError('배송지 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryAddresses();
  }, []);

  const handleSetDefault = async () => {
    if (!selectedId) return;

    try {
      setIsSaving(true);

      // Find the selected address
      const selectedAddress = addresses.find(
        (addr) => addr.deliveryAddressId === selectedId
      );

      if (!selectedAddress) {
        setToastType('error');
        setToastMessage('선택된 배송지를 찾을 수 없습니다.');
        return;
      }

      // Create update request to set this address as default
      const updateRequest: UpdateDeliveryAddressRequest = {
        roadAddress: selectedAddress.roadAddress || '',
        detailedAddress: selectedAddress.detailedAddress || '',
        zipCode: selectedAddress.zipCode || '',
        isDefault: true, // Set as default
      };

      console.log('🔄 Setting address as default:');
      console.log('📍 Selected address ID:', selectedId);
      console.log('📍 Selected address data:', selectedAddress);
      console.log('📤 Update request:', updateRequest);

      const response = await DeliveryAddressService.updateDeliveryAddress(
        selectedId,
        updateRequest
      );

      console.log('📥 Update response:', response);

      if (response.error) {
        console.log('❌ Update error:', response.error);
        setToastType('error');
        setToastMessage(response.error);
        return;
      }

      if (response.data?.success) {
        console.log('✅ Update successful, updating local state');
        // Update local state - set this address as default and unset others
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            default: addr.deliveryAddressId === selectedId,
          }))
        );

        setToastType('success');
        setToastMessage('기본 배송지가 설정되었습니다.');
      } else {
        setToastType('error');
        setToastMessage('기본 배송지 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      setToastType('error');
      setToastMessage('기본 배송지 설정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = () => {
    setIsAddingNew(true);
    setNewAddressForm({
      zipCode: '',
      roadAddress: '',
      detailedAddress: '',
      default: false,
    });

    // Scroll to the add form after a short delay to ensure it's rendered
    setTimeout(() => {
      if (addFormRef.current) {
        addFormRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
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
    setNewAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveNewAddress = async () => {
    try {
      setIsSaving(true);

      const createRequest: CreateDeliveryAddressRequest = {
        roadAddress: newAddressForm.roadAddress,
        detailedAddress: newAddressForm.detailedAddress,
        zipCode: newAddressForm.zipCode,
        default: newAddressForm.default,
      };

      console.log('📤 Creating address with request:', createRequest);
      console.log('📤 Form data:', newAddressForm);

      const response = await DeliveryAddressService.createDeliveryAddress(
        createRequest
      );

      console.log('📥 Create response:', response);

      if (response.error) {
        setToastType('error');
        setToastMessage(response.error);
        return;
      }

      if (response.data?.success && response.data?.data) {
        // Add the new address to the list
        setAddresses((prev) => [...prev, response.data!.data]);

        setIsAddingNew(false);
        setToastType('success');
        setToastMessage('배송지가 성공적으로 추가되었습니다.');
      } else {
        setToastType('error');
        setToastMessage('배송지 추가에 실패했습니다.');
      }
    } catch (error) {
      setToastType('error');
      setToastMessage('배송지 추가에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAddress = (addressId: string) => {
    const address = addresses.find(
      (addr) => addr.deliveryAddressId === addressId
    );
    if (address) {
      setEditingId(addressId);
      setEditForm({
        zipCode: address.zipCode || '',
        roadAddress: address.roadAddress || '',
        detailedAddress: address.detailedAddress || '',
        default: address.default,
      });
    }
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
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      setIsSaving(true);

      const updateRequest: UpdateDeliveryAddressRequest = {
        roadAddress: editForm.roadAddress,
        detailedAddress: editForm.detailedAddress,
        zipCode: editForm.zipCode,
        isDefault: editForm.default,
      };

      const response = await DeliveryAddressService.updateDeliveryAddress(
        editingId,
        updateRequest
      );

      if (response.error) {
        setToastType('error');
        setToastMessage(response.error);
        return;
      }

      if (response.data?.success) {
        // Update local state with the updated address
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.deliveryAddressId === editingId
              ? {
                  ...addr,
                  ...updateRequest,
                }
              : addr
          )
        );

        setEditingId(null);
        setToastType('success');
        setToastMessage('배송지가 성공적으로 수정되었습니다.');
      } else {
        setToastType('error');
        setToastMessage('배송지 수정에 실패했습니다.');
      }
    } catch (error) {
      setToastType('error');
      setToastMessage('배송지 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToastClose = () => {
    setToastMessage(null);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ProductHeader />
        <div className={styles.content}>
          <div className={styles.error}>{error}</div>
          <button
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProductHeader />

      {/* Toast Message */}
      {toastMessage && (
        <ToastMessage
          message={toastMessage}
          onClose={handleToastClose}
          duration={toastType === 'error' ? 5000 : 3000}
        />
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>배송지 관리</h1>
          <p className={styles.subtitle}>
            배송지를 추가하고 기본 배송지를 설정할 수 있습니다.
          </p>
        </div>

        {addresses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📍</div>
            <h3 className={styles.emptyTitle}>등록된 배송지가 없습니다</h3>
            <p className={styles.emptyDescription}>
              첫 번째 배송지를 추가해보세요.
            </p>
            <button className={styles.addFirstBtn} onClick={handleAddAddress}>
              <FaPlus className={styles.plusIcon} />
              배송지 추가하기
            </button>
          </div>
        ) : (
          <>
            <div className={styles.addressList}>
              {addresses.map((address) => (
                <div
                  key={address.deliveryAddressId}
                  className={styles.addressCard}
                >
                  {editingId === address.deliveryAddressId ? (
                    // Edit Mode
                    <div className={styles.editForm}>
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
                            handleEditFormChange(
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
                            checked={editForm.default}
                            onChange={(e) =>
                              handleEditFormChange('default', e.target.checked)
                            }
                            className={styles.checkbox}
                          />
                          기본 배송지로 설정
                        </label>
                      </div>

                      <div className={styles.editActions}>
                        <button
                          className={styles.cancelBtn}
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          취소
                        </button>
                        <button
                          className={styles.saveBtn}
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                        >
                          {isSaving ? '저장 중...' : '저장'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className={styles.cardHeader}>
                        <label className={styles.radioWrapper}>
                          <input
                            type="radio"
                            name="address"
                            checked={selectedId === address.deliveryAddressId}
                            onChange={() =>
                              setSelectedId(address.deliveryAddressId)
                            }
                          />
                          <span className={styles.customRadio}></span>
                        </label>
                        <div className={styles.addressInfo}>
                          <div className={styles.addressLabel}>
                            {address.label || '기본 배송지'}
                            {address.default && (
                              <span className={styles.defaultBadge}>기본</span>
                            )}
                          </div>
                          <div className={styles.recipientInfo}>
                            <span className={styles.recipientName}>
                              {address.recipientName || '수신자 정보 없음'}
                            </span>
                            <span className={styles.phoneNumber}>
                              {address.phoneNumber || '연락처 정보 없음'}
                            </span>
                          </div>
                          <div className={styles.addressDetails}>
                            <span className={styles.zipCode}>
                              ({address.zipCode})
                            </span>
                            <span className={styles.roadAddress}>
                              {address.roadAddress}
                            </span>
                            {address.detailedAddress && (
                              <span className={styles.detailedAddress}>
                                {address.detailedAddress}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={styles.cardActions}>
                        <button
                          className={styles.editBtn}
                          onClick={() =>
                            handleEditAddress(address.deliveryAddressId)
                          }
                        >
                          수정
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Address Form */}
            {isAddingNew && (
              <div ref={addFormRef} className={styles.addressCard}>
                <div className={styles.editForm}>
                  <h3 className={styles.formTitle}>새 배송지 추가</h3>

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
                        handleNewAddressFormChange(
                          'roadAddress',
                          e.target.value
                        )
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
                          handleNewAddressFormChange(
                            'default',
                            e.target.checked
                          )
                        }
                        className={styles.checkbox}
                      />
                      기본 배송지로 설정
                    </label>
                  </div>

                  <div className={styles.editActions}>
                    <button
                      className={styles.cancelBtn}
                      onClick={handleCancelAdd}
                      disabled={isSaving}
                    >
                      취소
                    </button>
                    <button
                      className={styles.saveBtn}
                      onClick={handleSaveNewAddress}
                      disabled={isSaving}
                    >
                      {isSaving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.bottomActions}>
              <button className={styles.addBtn} onClick={handleAddAddress}>
                <FaPlus className={styles.plusIcon} />
                배송지 추가
              </button>
              <button
                className={styles.setDefaultBtn}
                onClick={handleSetDefault}
                disabled={!selectedId || isSaving}
              >
                {isSaving ? '설정 중...' : '기본 배송지로 설정'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import styles from './AddAddress.module.css';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { AddressService } from '@/app/api/services/client/addressService/addressService';
import { AddressSearchResult } from '@/app/api/types/address/addressSearch';
import { DeliveryAddressService } from '@/app/api/services/client/memberService/member-information/deliveryAddressService';

export default function AddAddressPage() {
  const router = useRouter();
  const detailRef = useRef<HTMLInputElement | null>(null);

  // Core address fields
  const [zipCode, setZipCode] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  // NEW: required by API
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // This is addressTitle in the API
  const [addressName, setAddressName] = useState('');

  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  // Address search states (same pattern as MembershipInformation.tsx)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState('');
  const [addressSearchResults, setAddressSearchResults] = useState<
    AddressSearchResult[]
  >([]);
  const [showAddressResults, setShowAddressResults] = useState(false);

  // Try zip first; if empty, fallback to roadAddress input as keyword
  const keyword = zipCode.trim() || roadAddress.trim();
  const canSearch = !!keyword && !isSearchingAddress;

  // ---------- helpers to avoid `any` ----------
  type UnknownRecord = Record<string, unknown>;

  const isObject = (v: unknown): v is UnknownRecord =>
    typeof v === 'object' && v !== null;

  const formatValue = (v: unknown): string => {
    if (Array.isArray(v)) return v.map(formatValue).join(', ');
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean'
    )
      return String(v);
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  /** Extracts a human-friendly server message without using `any`. */
  const extractServerMessage = (res: unknown): string => {
    if (!isObject(res)) return '저장에 실패했습니다. 다시 시도해주세요.';

    const data = res.data;
    if (!isObject(data)) return '저장에 실패했습니다. 다시 시도해주세요.';

    // Prefer a field-level validation map if present
    const validation = data.data;
    if (isObject(validation)) {
      const parts = Object.entries(validation).map(
        ([k, v]) => `${k}: ${formatValue(v)}`
      );
      if (parts.length) return parts.join('\n');
    }

    // Otherwise fall back to a top-level message if available
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    return '저장에 실패했습니다. 다시 시도해주세요.';
  };

  const isSuccessResponse = (res: unknown): boolean => {
    if (!isObject(res)) return false;
    const data = res.data;
    return isObject(data) && typeof data.success === 'boolean'
      ? data.success
      : false;
  };
  // -------------------------------------------

  const handleAddressSearch = async () => {
    if (isSearchingAddress) return;

    setAddressSearchError('');
    setAddressSearchResults([]);
    setShowAddressResults(false);

    if (!keyword) {
      setAddressSearchError('주소 키워드를 입력해주세요.');
      return;
    }

    setIsSearchingAddress(true);
    try {
      const response = await AddressService.searchAddressByKeyword(
        keyword,
        1,
        10
      );

      if ((response as UnknownRecord).error) {
        setAddressSearchError(String((response as UnknownRecord).error));
        return;
      }

      const docs = (response as UnknownRecord)?.data as
        | UnknownRecord
        | undefined;
      const documents =
        isObject(docs) && Array.isArray(docs.documents) ? docs.documents : [];

      if (documents.length) {
        setAddressSearchResults(documents as AddressSearchResult[]);
        setShowAddressResults(true);
      } else {
        setAddressSearchError(
          '검색 결과가 없습니다. 다른 키워드로 검색해보세요.'
        );
      }
    } catch {
      setAddressSearchError('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleZipKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAddressSearch();
    }
  };

  const handleAddressSelect = (selected: AddressSearchResult) => {
    const formatted = AddressService.formatAddress(selected);
    const postal = AddressService.extractPostalCode(selected);

    setRoadAddress(formatted || '');
    setZipCode(postal || '');
    setDetailAddress('');
    setShowAddressResults(false);
    setAddressSearchResults([]);
    setAddressSearchError('');

    // focus 상세주소
    setTimeout(() => detailRef.current?.focus(), 50);
  };

  const resetForm = () => {
    setZipCode('');
    setRoadAddress('');
    setDetailAddress('');
    setAddressName('');
    setReceiverName('');
    setReceiverPhone('');
    setIsDefault(false);
    setShowAddressResults(false);
    setAddressSearchResults([]);
    setAddressSearchError('');
  };

  const validate = () => {
    const phoneOk = /^[0-9+\-\s]+$/.test(receiverPhone.trim());
    if (!zipCode.trim()) return toast.error('우편번호를 입력하세요.'), false;
    if (!roadAddress.trim())
      return toast.error('도로명 주소를 입력하세요.'), false;
    if (!receiverName.trim())
      return toast.error('수령인 이름을 입력하세요.'), false;
    if (!receiverPhone.trim())
      return toast.error('수령인 연락처를 입력하세요.'), false;
    if (!phoneOk) return toast.error('연락처 형식이 올바르지 않습니다.'), false;
    if (!addressName.trim())
      return toast.error('배송지명을 입력하세요.'), false; // maps to addressTitle
    return true;
  };

  const onSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);

      // Payload expected by backend
      const payload = {
        roadAddress,
        detailedAddress: detailAddress,
        zipCode,
        default: isDefault,
        addressTitle: addressName, // 배송지명 -> addressTitle
        receiverName, // NEW required
        receiverPhone, // NEW required
      };

      const res = await DeliveryAddressService.createDeliveryAddress(payload);

      if (isSuccessResponse(res)) {
        toast.success('배송지가 저장되었습니다.');
        router.back();
      } else {
        toast.error(extractServerMessage(res));
      }
    } catch (e) {
      console.error(e);
      toast.error('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (
      zipCode ||
      roadAddress ||
      detailAddress ||
      addressName ||
      receiverName ||
      receiverPhone ||
      isDefault
    ) {
      if (!confirm('입력한 내용을 모두 지울까요?')) return;
      resetForm();
      toast('입력 내용이 초기화되었습니다.');
    } else {
      router.back();
    }
  };

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        <div className={styles.formCard}>
          <label className={styles.label}>배송지 주소</label>

          <div className={styles.inputRow}>
            <input
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              onKeyDown={handleZipKeyDown}
              placeholder="04580"
              className={styles.input}
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className={`${styles.searchBtn} ${
                canSearch ? styles.enabled : ''
              }`}
              disabled={!canSearch}
            >
              {isSearchingAddress ? '검색 중...' : '주소 검색'}
            </button>
          </div>

          {/* Optional free-text keyword via roadAddress field to broaden search */}
          <input
            value={roadAddress}
            onChange={(e) => setRoadAddress(e.target.value)}
            placeholder="서울특별시 강남구 선릉로100길 1"
            className={styles.input}
          />

          {/* Address Search Results */}
          {showAddressResults && addressSearchResults.length > 0 && (
            <div className={styles.addressResults}>
              <div className={styles.addressResultsHeader}>
                검색 결과 ({addressSearchResults.length}개)
              </div>
              {addressSearchResults.map((res, idx) => (
                <div
                  key={idx}
                  className={styles.addressResultItem}
                  onClick={() => handleAddressSelect(res)}
                >
                  <div className={styles.addressResultMain}>
                    {AddressService.formatAddress(res)}
                  </div>
                  {(() => {
                    const z = AddressService.extractPostalCode(res);
                    return z ? (
                      <div className={styles.addressResultPostal}>
                        우편번호: {z}
                      </div>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>
          )}
          {addressSearchError && (
            <p className={styles.error}>{addressSearchError}</p>
          )}

          {/* 상세주소 */}
          <input
            ref={detailRef}
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            placeholder="상세주소 (예: 5층 길동식당)"
            className={styles.input}
          />

          <input
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder="수령인 이름"
            className={styles.input}
          />

          <input
            value={receiverPhone}
            onChange={(e) => setReceiverPhone(e.target.value)}
            placeholder="수신자 전화번호"
            className={styles.input}
            inputMode="tel"
          />

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className={styles.checkbox}
            />
            <span>기본 배송지로 설정</span>
          </label>

          <div className={styles.divider} />

          {/* 배송지명 -> addressTitle */}
          <div className={styles.subLabelWrap}>
            <span className={styles.subLabel}>배송지명</span>
          </div>
          <input
            value={addressName}
            onChange={(e) => setAddressName(e.target.value)}
            placeholder="예: 우리집 / 회사 / 길동식당"
            className={styles.input}
          />

          <p className={styles.helpText}>
            저장하기 버튼을 누르지 않으면, 입력한 정보가 저장되지 않습니다.
          </p>
        </div>

        <div className={styles.buttonsRow}>
          <button
            type="button"
            onClick={onDelete}
            className={styles.btnOutline}
          >
            삭제
          </button>
          <button
            type="button"
            onClick={onSave}
            className={styles.btnPrimary}
            disabled={saving}
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </>
  );
}

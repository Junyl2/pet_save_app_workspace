'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { CiImageOn } from 'react-icons/ci';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { MemberInquiryService } from '@/app/api/services/client/memberService/inquiry-details/memberInquiryService';
import s from './ContactCreate.module.css';

const CATEGORY_OPTIONS = [
  { label: '상품 문의', value: 'PRODUCT' },
  { label: '배송/픽업 문의', value: 'DELIVERY' },
  { label: '교환/반품 문의', value: 'EXCHANGE_RETURN' },
  { label: '결제 문의', value: 'PAYMENT' },
  { label: '기타 문의', value: 'OTHER' },
];

export default function ContactCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || '';

  // form state
  const [category, setCategory] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // dropdown
  const [openDropdown, setOpenDropdown] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const charLimit = 500;
  const remaining = useMemo(
    () => Math.max(charLimit - message.length, 0),
    [message]
  );

  // file picker
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openFilePicker = () => fileInputRef.current?.click();
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImages((prev) => [...prev, ...files]);
  };
  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const canSubmit =
    !!category && message.trim().length > 0 && message.length <= charLimit;

  // close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        openDropdown &&
        !anchorRef.current?.contains(t) &&
        !panelRef.current?.contains(t)
      ) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdown]);

  const selectCategory = (value: string) => {
    setCategory(value);
    setOpenDropdown(false);
  };

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;

    // Validate: productId is required when category is 'PRODUCT'
    if (category === 'PRODUCT' && (!productId || productId.trim() === '')) {
      toast.error('상품 문의는 상품 ID가 필수입니다. 상품 상세 페이지에서 문의를 남겨주세요.');
      return;
    }

    try {
      setSubmitting(true);

      // 1️⃣ Upload selected files
      let fileIds: string[] = [];
      if (images.length > 0) {
        const uploadRes = await MemberInquiryService.uploadInquiryFiles(images);
        if (!uploadRes.error && uploadRes.data?.data?.length) {
          fileIds = uploadRes.data.data.map((f: any) => f.fileId);
        }
      }

      // 2️⃣ Create inquiry
      // productId is optional for non-PRODUCT categories, but always include if available
      const inquiryRequest: {
        productId?: string;
        category: 'EXCHANGE_RETURN' | 'PRODUCT' | 'DELIVERY' | 'PAYMENT' | 'OTHER';
        content: string;
        imageFileIds: string[];
      } = {
        category: category as
          | 'EXCHANGE_RETURN'
          | 'PRODUCT'
          | 'DELIVERY'
          | 'PAYMENT'
          | 'OTHER',
        content: message,
        imageFileIds: fileIds,
      };

      // Only include productId if it's provided (required for PRODUCT category, optional for others)
      if (productId && productId.trim() !== '') {
        inquiryRequest.productId = productId.trim();
      }

      const response = await MemberInquiryService.createInquiry(inquiryRequest);

      if (response.error) {
        // Show the specific error message from the service
        toast.error(response.error);
        return;
      }

      toast.success('문의가 정상적으로 접수되었습니다.');
      setTimeout(
        () => router.push('/client/pages/my-page/history-inquiry'),
        1500
      );
    } catch (error) {
      console.error('[ContactCreatePage] Submit error:', error);
      toast.error('문의 접수 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ProductHeader />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
            textAlign: 'center',
          },
          success: {
            style: { background: '#2F6F5E', color: '#fff' },
            iconTheme: { primary: '#2F6F5E', secondary: '#fff' },
          },
        }}
      />

      <div className={s.pageWrap}>
        {/* Top tabs */}
        <div className={s.topTabsBar}>
          <button
            className={`${s.topTab} ${s.topTabInactive}`}
            onClick={() => router.push('/client/pages/my-page/history-inquiry')}
          >
            문의내역
          </button>
          <button
            className={`${s.topTab} ${s.topTabActive}`}
            aria-current="page"
          >
            문의하기
          </button>
        </div>

        {/* Category dropdown */}
        <div className={s.sectionBar}>
          <button
            ref={anchorRef}
            type="button"
            className={s.cardRow}
            onClick={() => setOpenDropdown((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={openDropdown}
          >
            <span className={`${s.placeholder} ${category ? s.selected : ''}`}>
              {CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label ??
                '문의 유형'}
            </span>
            {openDropdown ? (
              <FaChevronUp className={s.chev} />
            ) : (
              <FaChevronDown className={s.chev} />
            )}
          </button>

          {openDropdown && (
            <div ref={panelRef} className={s.dropdownPanel} role="listbox">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={category === opt.value}
                  className={`${s.dropdownItem} ${
                    category === opt.value ? s.dropdownItemActive : ''
                  }`}
                  onClick={() => selectCategory(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message + Attachments */}
        <div className={s.whiteBlock}>
          <textarea
            className={s.textarea}
            placeholder="문의 내용을 입력해주세요 (500자 이내)"
            maxLength={charLimit}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className={s.attachCard} onClick={openFilePicker}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={onFilesSelected}
            />
            <div className={s.attachInner}>
              <CiImageOn color="rgba(0,0,0,0.4)" />
              <span className={s.attachText}>사진 첨부하기</span>
            </div>
          </div>

          {images.length > 0 && (
            <div className={s.attachList}>
              {images.map((file, idx) => (
                <div key={file.name + idx} className={s.attachItem}>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    width={60}
                    height={60}
                    className={s.preview}
                  />
                  <span className={s.fileName}>{file.name}</span>
                  <button
                    type="button"
                    className={s.removeBtn}
                    onClick={() => removeImage(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className={s.helperText}>
            문의하신 내용에 대한 답변은 마이페이지 1:1 문의에서 확인할 수
            있습니다.
          </p>
          <div className={s.counterWrap}>
            <span className={remaining === 0 ? s.counterMax : ''}>
              {remaining}
            </span>{' '}
            / {charLimit}
          </div>
        </div>

        {/* Submit */}
        <div className={s.bottomBar}>
          <button
            className={`${s.submitBtn} ${canSubmit ? s.submitBtnActive : ''}`}
            disabled={!canSubmit || submitting}
            onClick={onSubmit}
          >
            {submitting ? '전송 중...' : '문의하기'}
          </button>
        </div>
      </div>
    </>
  );
}

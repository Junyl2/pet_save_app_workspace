'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import s from './ContactCreate.module.css';
import { contactService } from '@/app/api/services/contact-service/contactService';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { CiImageOn } from 'react-icons/ci';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';

const CATEGORY_OPTIONS = [
  '상품 문의',
  '배송/픽업 문의',
  '교환/반품 문의',
  '결제 문의',
  '포인트 문의',
  '기타 문의',
];

export default function ContactCreatePage() {
  const router = useRouter();

  // form state
  const [category, setCategory] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // dropdown state
  const [openDropdown, setOpenDropdown] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const charLimit = 500;
  const remaining = useMemo(
    () => Math.max(charLimit - message.length, 0),
    [message]
  );

  // file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openFilePicker = () => fileInputRef.current?.click();
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImages((prev) => [...prev, ...files]);
  };
  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSubmit =
    category.trim() && message.trim().length > 0 && message.length <= charLimit;

  // close dropdown on outside click / ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (
        openDropdown &&
        !anchorRef.current?.contains(t) &&
        !panelRef.current?.contains(t)
      ) {
        setOpenDropdown(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenDropdown(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openDropdown]);

  const selectCategory = (value: string) => {
    setCategory(value);
    setOpenDropdown(false);
  };

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);

      // If your service doesn’t have createInquiry yet, add it as shown earlier.
      await contactService.createInquiry({
        category,
        message,
        images: images.map((f) => f.name),
      });

      router.push('/client/seller/pages/history-inquiry');
    } catch (e) {
      console.error(e);
      alert('문의 제출에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ProductHeader />
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

        {/* Category section (Frame 1576 + dropdown) */}
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
              {category || '문의 유형'}
            </span>

            {/* toggle between up/down */}
            {openDropdown ? (
              <FaChevronUp className={s.chev} aria-hidden="true" />
            ) : (
              <FaChevronDown className={s.chev} aria-hidden="true" />
            )}
          </button>

          {openDropdown && (
            <div
              ref={panelRef}
              className={s.dropdownPanel}
              role="listbox"
              aria-label="문의 유형 선택"
            >
              {/* Exactly 6 rows @ 35px height each, border + white bg (0.8) */}
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={category === opt}
                  className={`${s.dropdownItem} ${
                    category === opt ? s.dropdownItemActive : ''
                  }`}
                  onClick={() => selectCategory(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content block */}
        <div className={s.whiteBlock}>
          <div className={s.textCard}>
            <textarea
              className={s.textarea}
              placeholder="문의 내용을 입력해주세요 (500자 이내)"
              maxLength={charLimit}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

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
              {images.map((f, idx) => (
                <div key={`${f.name}-${idx}`} className={s.attachItem}>
                  <span className={s.fileName} title={f.name}>
                    {f.name}
                  </span>
                  <button
                    className={s.removeBtn}
                    onClick={() => removeImage(idx)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className={s.helperText}>
            문의하신 내용에 대한 답변은 앱의 마이페이지 1:1 문의에서 확인하실 수
            있습니다
          </p>
          <div className={s.counterWrap}>
            <span className={remaining === 0 ? s.counterMax : ''}>
              {remaining}
            </span>{' '}
            / {charLimit}
          </div>
        </div>

        {/* Bottom submit */}
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

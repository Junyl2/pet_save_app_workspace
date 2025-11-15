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
  type AttachedImage = { id: string; file: File; url: string };
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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
    const files = e.target.files;
    if (!files) return;
    const additions = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
    }));
    setAttachedImages((prev) => [...prev, ...additions]);
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const removeImage = (id: string) => {
    setAttachedImages((prev) => {
      const img = prev.find((x) => x.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((x) => x.id !== id);
    });
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      attachedImages.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [attachedImages]);

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
    if (!canSubmit || submitting || uploadingFiles) return;

    // Validate: productId is required when category is 'PRODUCT'
    if (category === 'PRODUCT' && (!productId || productId.trim() === '')) {
      toast.error(
        '상품 문의는 상품 ID가 필수입니다. 상품 상세 페이지에서 문의를 남겨주세요.'
      );
      return;
    }

    setSubmitting(true);
    let uploadedEncryptedIds: string[] = [];
    let uploadedFileIds: string[] = [];

    try {
      // Step 1: Upload files first and get encryptedId
      if (attachedImages.length > 0) {
        setUploadingFiles(true);
        const files = attachedImages.map((img) => img.file);

        const uploadResponse = await MemberInquiryService.uploadInquiryFiles(
          files,
          {
            entityType: 'INQUIRY',
            documentType: 'INQUIRY_ATTACHMENT',
            description: `Attachment for inquiry - ${category}`,
          }
        );

        if (uploadResponse.error || !uploadResponse.data?.data) {
          throw new Error(
            uploadResponse.error || '파일 업로드에 실패했습니다.'
          );
        }

        uploadedEncryptedIds = uploadResponse.data.data
          .filter((f: { encryptedId?: string }) => f.encryptedId)
          .map((f: { encryptedId: string }) => f.encryptedId);

        uploadedFileIds = uploadResponse.data.data
          .filter((f: { fileId?: string }) => f.fileId)
          .map((f: { fileId: string }) => f.fileId);

        if (attachedImages.length > 0 && uploadedEncryptedIds.length === 0) {
          throw new Error('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
        }
      }

      // Step 2: Create inquiry with encryptedIds (empty initially, will attach after)
      const inquiryRequest: {
        productId?: string;
        category:
          | 'EXCHANGE_RETURN'
          | 'PRODUCT'
          | 'DELIVERY'
          | 'PAYMENT'
          | 'OTHER';
        content: string;
        imageFileIds?: string[];
      } = {
        category: category as
          | 'EXCHANGE_RETURN'
          | 'PRODUCT'
          | 'DELIVERY'
          | 'PAYMENT'
          | 'OTHER',
        content: message,
        imageFileIds:
          uploadedEncryptedIds.length > 0 ? uploadedEncryptedIds : undefined,
      };

      // Only include productId if it's provided (required for PRODUCT category, optional for others)
      if (productId && productId.trim() !== '') {
        inquiryRequest.productId = productId.trim();
      }

      const response = await MemberInquiryService.createInquiry(inquiryRequest);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      // Step 3: Attach files to the inquiry entity
      // For inquiry files, attach each file individually using fileId as entityId
      if (uploadedFileIds.length > 0) {
        for (const fileId of uploadedFileIds) {
          await MemberInquiryService.attachFilesToInquiry(fileId, [fileId]);
        }
      }

      toast.success('문의가 정상적으로 접수되었습니다.');
      setTimeout(
        () => router.push('/client/pages/my-page/history-inquiry'),
        1500
      );
    } catch (err) {
      console.error('[ContactCreatePage] Submit error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : '문의 접수 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
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

          {attachedImages.length > 0 && (
            <div className={s.filePreviewsContainer}>
              {attachedImages.map((img) => (
                <div key={img.id} className={s.filePreview}>
                  <div className={s.imageContainer}>
                    <Image
                      src={img.url}
                      alt="Preview"
                      width={100}
                      height={100}
                      className={s.previewImage}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className={s.removeFileButton}
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                  <div className={s.fileInfo}>
                    <p className={s.fileName}>{img.file.name}</p>
                  </div>
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
            disabled={!canSubmit || submitting || uploadingFiles}
            onClick={onSubmit}
          >
            {uploadingFiles
              ? '파일 업로드 중...'
              : submitting
              ? '문의 중...'
              : '문의하기'}
          </button>
        </div>
      </div>
    </>
  );
}

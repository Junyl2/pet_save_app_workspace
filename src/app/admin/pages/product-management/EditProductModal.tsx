'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IoChevronDownOutline } from 'react-icons/io5';
import styles from './EditProductModal.module.css';
import { ProductService } from '@/app/api/services/client/productService/productService';
import { ProductManagementService } from '@/app/api/services/admin/productManagement/productManagementService';
import { FileProductService } from '@/app/api/services/client/productService/fileProductService';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import { ProductSummary } from '@/app/api/types/products/productSummary';
import { Category } from '@/app/api/types/category/category';
import { RegistrationStatus } from '@/app/api/types/products/createProduct';
import { ProductUpdateRequest } from '@/app/api/services/admin/productManagement/productManagement';

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  onSuccess: () => void;
}

interface ImageFile {
  file?: File;
  preview: string;
  fileId?: string;
  encryptedId?: string;
  isUploading: boolean;
  uploadError?: string | null;
}

export default function EditProductModal({
  open,
  onClose,
  productId,
  onSuccess,
}: EditProductModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    quantity: 0,
    salePrice: 0,
    discountedPrice: 0,
    allowPoints: false,
    expiryDate: '',
    registrationStatus: 'ONSALE' as RegistrationStatus,
  });

  const [images, setImages] = useState<ImageFile[]>([]);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!open || !productId) return;
      setLoading(true);
      setError(null);

      try {
        const [productRes, categoriesRes] = await Promise.all([
          ProductService.getProductSummary(productId),
          CategoryService.getAllCategories({ size: 100 }),
        ]);

        if (productRes.error || !productRes.data?.data) {
          throw new Error(productRes.error || 'Failed to fetch product');
        }

        if (categoriesRes.error || !categoriesRes.data?.data) {
          throw new Error('Failed to fetch categories');
        }

        const productData = productRes.data.data;
        setProduct(productData);
        setCategories(categoriesRes.data.data.content);

        const categoryId =
          productData.category && productData.category.length > 0
            ? categoriesRes.data.data.content.find(
                (c) => c.categoryName === productData.category[0]
              )?.categoryId || ''
            : '';

        setFormData({
          name: productData.productName || '',
          categoryId,
          description: productData.description || '',
          quantity: productData.quantity || 0,
          salePrice: productData.salePrice || 0,
          discountedPrice: productData.discountedPrice || 0,
          allowPoints: productData.pointsUsageAllowed || false,
          expiryDate: productData.expiryDate || '',
          registrationStatus:
            productData.registrationStatus === 'ONSALE'
              ? RegistrationStatus.ONSALE
              : RegistrationStatus.SOLDOUT,
        });

        const filesRes = await FileProductService.getEntityFiles(productId);
        if (filesRes.data?.data && filesRes.data.data.length > 0) {
          const imageFiles: ImageFile[] = filesRes.data.data.map((file) => ({
            preview: file.url || productData.images?.[0] || '',
            fileId: file.fileId,
            encryptedId: file.encryptedId,
            isUploading: false,
          }));
          setImages(imageFiles);
        } else if (productData.images && productData.images.length > 0) {
          const imageFiles: ImageFile[] = productData.images.map((imgUrl) => {
            const urlParts = imgUrl.split('/');
            const encryptedId = urlParts[urlParts.length - 1];
            return {
              preview: imgUrl,
              encryptedId: encryptedId || undefined,
              isUploading: false,
            };
          });
          setImages(imageFiles);
        } else {
          setImages([]);
        }
      } catch (err) {
        console.error('[EditProductModal] Fetch error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load product data'
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [open, productId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? Number(value)
          : value,
    }));
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentLength = images.length;
    const newFiles: ImageFile[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isUploading: true,
      uploadError: null,
    }));

    setImages((prev) => [...prev, ...newFiles]);

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i].file;
      if (!file) continue;

      try {
        const uploadRes = await FileProductService.uploadFile({
          file,
          metadata: {
            entityType: 'product',
            description: 'Product image',
            isAttached: false,
          },
        });

        if (uploadRes.error || !uploadRes.data?.data) {
          throw new Error(uploadRes.error || 'Upload failed');
        }

        const uploadedFile = uploadRes.data.data;

        setImages((prev) =>
          prev.map((img, idx) => {
            const newFileIndex = currentLength + i;
            if (idx === newFileIndex) {
              return {
                ...img,
                fileId: uploadedFile.fileId,
                encryptedId: uploadedFile.encryptedId,
                isUploading: false,
                uploadError: null,
              };
            }
            return img;
          })
        );

        if (uploadedFile.fileId) {
          await FileProductService.attachFiles(productId, {
            fileIds: [uploadedFile.fileId],
          });
        }
      } catch (err) {
        console.error('[EditProductModal] File upload error:', err);
        setImages((prev) =>
          prev.map((img, idx) => {
            const newFileIndex = currentLength + i;
            if (idx === newFileIndex) {
              return {
                ...img,
                isUploading: false,
                uploadError:
                  err instanceof Error ? err.message : 'Upload failed',
              };
            }
            return img;
          })
        );
      }
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (index: number): Promise<void> => {
    const imageToRemove = images[index];
    if (!imageToRemove) return;

    if (imageToRemove.encryptedId && imageToRemove.preview.startsWith('http')) {
      try {
        await FileProductService.deleteFile(imageToRemove.encryptedId);
      } catch (err) {
        console.error('[EditProductModal] Failed to delete file:', err);
      }
    }

    if (imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!productId) return;

    setSaving(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        setError('상품명을 입력해주세요.');
        setSaving(false);
        return;
      }

      if (!formData.categoryId) {
        setError('카테고리를 선택해주세요.');
        setSaving(false);
        return;
      }

      if (formData.quantity < 0) {
        setError('재고 수량은 0 이상이어야 합니다.');
        setSaving(false);
        return;
      }

      if (formData.salePrice <= 0) {
        setError('판매가는 0보다 커야 합니다.');
        setSaving(false);
        return;
      }

      const imageFileIds = images
        .map((img) => img.encryptedId)
        .filter((id): id is string => Boolean(id));

      if (imageFileIds.length === 0) {
        setError('최소 하나의 이미지가 필요합니다.');
        setSaving(false);
        return;
      }

      const payload: ProductUpdateRequest = {
        imageFileIds,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        quantity: formData.quantity,
        salePrice: formData.salePrice,
        allowPoints: formData.allowPoints,
        registrationStatus: formData.registrationStatus,
        ...(formData.description.trim().length > 0 && {
          description: formData.description.trim(),
        }),
        ...(formData.discountedPrice &&
          formData.discountedPrice > 0 && {
            discountedPrice: formData.discountedPrice,
          }),
        ...(formData.expiryDate &&
          formData.expiryDate.trim().length > 0 && {
            expiryDate: formData.expiryDate.trim(),
          }),
      };

      console.log('[EditProductModal] Sending update payload:', payload);

      const { error: updateError } =
        await ProductManagementService.updateProduct(productId, payload);

      if (updateError) {
        throw new Error(updateError);
      }

      alert('상품 정보가 성공적으로 수정되었습니다.');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[EditProductModal] Update error:', err);
      setError(
        err instanceof Error ? err.message : '상품 수정 중 오류가 발생했습니다.'
      );
    } finally {
      setSaving(false);
    }
  };

  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          <h2 className={styles.title}>상품 수정</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : error && !product ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <label className={styles.label}>상품명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>카테고리 *</label>
              <div className={styles.dropdownWrapper}>
                <div
                  className={styles.dropdownHeader}
                  onClick={() => setCategoryOpen((prev) => !prev)}
                >
                  <span>
                    {formData.categoryId
                      ? categories.find(
                          (c) => c.categoryId === formData.categoryId
                        )?.categoryName || '카테고리를 선택해 주세요'
                      : '카테고리를 선택해 주세요'}
                  </span>
                  <IoChevronDownOutline className={styles.dropdownIcon} />
                </div>
                {categoryOpen && (
                  <div className={styles.dropdownList}>
                    {categories.map((cat) => (
                      <div
                        key={cat.categoryId}
                        className={styles.dropdownItem}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            categoryId: cat.categoryId,
                          }));
                          setCategoryOpen(false);
                        }}
                      >
                        {cat.categoryName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>상세 설명</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={4}
                placeholder="상품 상세 내용을 입력해 주세요"
              />
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>수량 *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className={styles.input}
                min="0"
                required
                placeholder="수량을 입력해 주세요"
              />
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>최종 판매가 *</label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleInputChange}
                className={styles.input}
                min="0"
                required
                placeholder="최종 가격을 입력해 주세요"
              />
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>원가</label>
              <input
                type="number"
                name="discountedPrice"
                value={formData.discountedPrice}
                onChange={handleInputChange}
                className={styles.input}
                min="0"
                placeholder="원가를 입력해 주세요"
              />
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>포인트 사용 허용</label>
              <input
                type="checkbox"
                name="allowPoints"
                checked={formData.allowPoints}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>유통기한</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="유통기한을 입력해 주세요"
              />
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>등록 상태 *</label>
              <div className={styles.dropdownWrapper}>
                <div
                  className={styles.dropdownHeader}
                  onClick={() => setStatusOpen((prev) => !prev)}
                >
                  <span>
                    {formData.registrationStatus === RegistrationStatus.ONSALE
                      ? '판매중'
                      : '품절'}
                  </span>
                  <IoChevronDownOutline className={styles.dropdownIcon} />
                </div>
                {statusOpen && (
                  <div className={styles.dropdownList}>
                    <div
                      className={styles.dropdownItem}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          registrationStatus: RegistrationStatus.ONSALE,
                        }));
                        setStatusOpen(false);
                      }}
                    >
                      판매중
                    </div>
                    <div
                      className={styles.dropdownItem}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          registrationStatus: RegistrationStatus.SOLDOUT,
                        }));
                        setStatusOpen(false);
                      }}
                    >
                      품절
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>이미지 *</label>
              <div className={styles.imageSection}>
                <div className={styles.imageGrid}>
                  {images.map((img, index) => (
                    <div key={index} className={styles.imageItem}>
                      <Image
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        width={120}
                        height={120}
                        className={styles.imagePreview}
                      />
                      {img.isUploading && (
                        <div className={styles.uploadingOverlay}>
                          업로드 중...
                        </div>
                      )}
                      {img.uploadError && (
                        <div
                          className={styles.uploadingOverlay}
                          style={{ backgroundColor: 'rgba(244, 67, 54, 0.9)' }}
                        >
                          업로드 실패
                        </div>
                      )}
                      {img.encryptedId &&
                        !img.isUploading &&
                        !img.uploadError && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '30px',
                              left: '4px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '10px',
                            }}
                          >
                            ✓ 완료
                          </div>
                        )}
                      <button
                        type="button"
                        className={styles.removeImageBtn}
                        onClick={() => handleRemoveImage(index)}
                        disabled={img.isUploading}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                />
                <button
                  type="button"
                  className={styles.addImageBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  이미지 추가
                </button>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={saving}
              >
                취소
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

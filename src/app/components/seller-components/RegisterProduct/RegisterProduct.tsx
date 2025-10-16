'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './RegisterProduct.module.css';
import { FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { CiImageOn } from 'react-icons/ci';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import { FileProductService } from '@/app/api/services/client/productService/fileProductService';
import { ProductService } from '@/app/api/services/client/productService/productService';
import { MemberStoreService } from '@/app/api/services/client/memberService/memberStore/memberStoreService';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import {
  ProductCreateRequest,
  RegistrationStatus,
} from '@/app/api/types/products/createProduct';
import { Category } from '@/app/api/types/category/category';

export default function RegisterProductForm() {
  const router = useRouter();

  // Multiple file upload states
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      file: File;
      preview: string;
      fileId: string;
      encryptedId: string;
      isUploading: boolean;
      uploadError: string | null;
      retryCount: number;
    }>
  >([]);
  const [imageFileIds, setImageFileIds] = useState<string[]>([]); // Stores encryptedIds, not fileIds
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [expiration, setExpiration] = useState('');
  const [status, setStatus] = useState<'판매중' | '품절'>('판매중');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Fetch store information and categories on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch store information
        console.log('Fetching store information...');
        const storeResponse = await MemberStoreService.getMyStore();

        if (storeResponse.error || !storeResponse.data) {
          console.error('Failed to fetch store info:', storeResponse.error);
          setError(
            '스토어 정보를 가져올 수 없습니다. 로그인 상태를 확인해주세요.'
          );
          return;
        }

        const storeData = storeResponse.data.data;
        setStoreId(storeData.storeId);
        console.log('Store info fetched successfully:', storeData);

        // Fetch categories
        console.log('Fetching categories...');
        const categoryResponse = await CategoryService.getAllCategories({
          size: 100, // Get all categories
          sortBy: 'displayOrder',
          direction: 'asc',
        });

        if (categoryResponse.error || !categoryResponse.data) {
          console.error('Failed to fetch categories:', categoryResponse.error);
          setError('카테고리 정보를 가져올 수 없습니다.');
          return;
        }

        const categoryData = categoryResponse.data.data.content;
        setCategories(categoryData);
        console.log('Categories fetched successfully:', categoryData);
        console.log('Number of categories loaded:', categoryData.length);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoadingStore(false);
        setIsLoadingCategories(false);
      }
    };

    fetchInitialData();
  }, []);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [uploadedFiles]);

  // Debug selectedCategoryId changes
  useEffect(() => {
    console.log('selectedCategoryId changed:', selectedCategoryId);
    if (selectedCategoryId) {
      const selectedCategory = categories.find(
        (c) => c.categoryId === selectedCategoryId
      );
      console.log('Selected category:', selectedCategory);
    }
  }, [selectedCategoryId, categories]);

  // Debug imageFileIds changes
  useEffect(() => {
    console.log('imageFileIds state changed:', imageFileIds);
  }, [imageFileIds]);

  // Handle multiple file upload with retry logic
  const handleFileUpload = async (
    file: File,
    index: number,
    retryCount = 0
  ) => {
    const preview = URL.createObjectURL(file);

    // Add file to state with uploading status
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = {
        file,
        preview,
        fileId: '',
        encryptedId: '',
        isUploading: true,
        uploadError: null,
        retryCount,
      };
      return newFiles;
    });

    try {
      console.log(
        `Starting file upload for index: ${index}, retry: ${retryCount}`
      );
      const uploadResponse = await FileProductService.uploadFile({
        file,
        metadata: {
          entityType: 'product',
          description: 'Product image',
          isAttached: false, // Mark as not attached initially
        },
      });

      if (uploadResponse.error || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'File upload failed');
      }

      const uploadedFile = uploadResponse.data.data;

      // Update the specific file in state
      setUploadedFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          fileId: uploadedFile.fileId,
          encryptedId: uploadedFile.encryptedId,
          isUploading: false,
          uploadError: null,
          retryCount,
        };
        return newFiles;
      });

      // Update imageFileIds with all encrypted IDs
      setImageFileIds((prev) => {
        const newIds = [...prev];
        newIds[index] = uploadedFile.encryptedId;
        return newIds.filter((id) => id); // Remove empty strings
      });

      console.log('File uploaded successfully:', uploadedFile);
    } catch (error) {
      console.error(`File upload failed (retry ${retryCount}):`, error);

      // If retry count is less than 3, retry with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying upload in ${delay}ms...`);

        setTimeout(() => {
          handleFileUpload(file, index, retryCount + 1);
        }, delay);
      } else {
        // Update the specific file with error after max retries
        setUploadedFiles((prev) => {
          const newFiles = [...prev];
          newFiles[index] = {
            ...newFiles[index],
            isUploading: false,
            uploadError:
              error instanceof Error
                ? error.message
                : '파일 업로드에 실패했습니다.',
            retryCount,
          };
          return newFiles;
        });
      }
    }
  };

  // Handle multiple file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const currentLength = uploadedFiles.length;

    // Create preview URLs for new files
    const newFileObjects = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      fileId: '',
      encryptedId: '',
      isUploading: true,
      uploadError: null,
      retryCount: 0,
    }));

    // Add new files to state
    setUploadedFiles((prev) => [...prev, ...newFileObjects]);

    // Upload each file
    newFiles.forEach((file, index) => {
      handleFileUpload(file, currentLength + index);
    });
  };

  // Handle file deletion
  const handleFileDelete = async (index: number) => {
    const fileToDelete = uploadedFiles[index];

    // If file was uploaded successfully, delete it from server
    if (fileToDelete.encryptedId) {
      try {
        await FileProductService.deleteFile(fileToDelete.encryptedId);
        console.log('File deleted from server:', fileToDelete.encryptedId);
      } catch (error) {
        console.error('Failed to delete file from server:', error);
      }
    }

    // Clean up preview URL
    URL.revokeObjectURL(fileToDelete.preview);

    // Remove file from state
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

    // Update imageFileIds
    setImageFileIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Form validation
      if (isLoadingStore) {
        setError('스토어 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      if (!storeId) {
        setError('스토어 정보를 찾을 수 없습니다. 로그인 상태를 확인해주세요.');
        return;
      }
      // Validate image upload
      if (uploadedFiles.length === 0) {
        setError('이미지를 첨부해주세요');
        return;
      }
      if (imageFileIds.length === 0) {
        const errorMsg =
          '이미지 업로드가 완료되지 않았습니다. 이미지를 다시 선택해주세요.';
        setError(errorMsg);
        alert(errorMsg);
        return;
      }

      // Check if any files are still uploading
      const isAnyUploading = uploadedFiles.some((file) => file.isUploading);
      if (isAnyUploading) {
        setError('이미지 업로드 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // Check if any files have upload errors
      const hasUploadErrors = uploadedFiles.some((file) => file.uploadError);
      if (hasUploadErrors) {
        setError('이미지 업로드에 실패했습니다. 다른 이미지를 선택해주세요.');
        return;
      }
      console.log('Form validation - selectedCategoryId:', selectedCategoryId);
      console.log('Form validation - categories length:', categories.length);
      if (!selectedCategoryId) {
        setError('카테고리를 선택해주세요');
        return;
      }
      if (!name) {
        setError('상품명을 입력해주세요');
        return;
      }
      if (!description) {
        setError('상세 내용을 입력해주세요');
        return;
      }
      if (!quantity || quantity <= 0) {
        setError('수량을 올바르게 입력해주세요');
        return;
      }
      if (!salePrice || salePrice <= 0) {
        setError('판매가를 올바르게 입력해주세요');
        return;
      }
      if (!expiration) {
        setError('유통기한을 입력해주세요');
        return;
      }

      console.log('Using uploaded files:', uploadedFiles.length);
      console.log(
        'Using imageFileIds (encryptedIds) for product creation:',
        imageFileIds
      );

      // Verify file info using encryptedIds
      console.log('Getting file info to verify...');
      for (const encryptedId of imageFileIds) {
        const fileInfoResponse = await FileProductService.getFileInfo(
          encryptedId
        );
        if (fileInfoResponse.data) {
          console.log(
            'File info retrieved successfully:',
            fileInfoResponse.data
          );
          const fileData = fileInfoResponse.data.data;
          console.log('File details:', {
            fileId: fileData.fileId,
            encryptedId: fileData.encryptedId,
            isAttached: fileData.isAttached,
            entityType: fileData.entityType,
            entityId: fileData.entityId,
          });
        } else {
          console.warn('Could not retrieve file info:', fileInfoResponse.error);
          throw new Error(
            `File verification failed: ${fileInfoResponse.error}`
          );
        }
      }

      // Step 1: Try creating product WITH image file ID first
      console.log('Creating product with image file ID...');
      let productRequest: ProductCreateRequest = {
        storeId: storeId,
        imageFileIds: imageFileIds, // Use the state-managed file IDs
        name,
        categoryId: selectedCategoryId,
        description,
        quantity: Number(quantity),
        salePrice: Number(salePrice),
        discountedPrice: costPrice ? Number(costPrice) : undefined,
        expiryDate: expiration,
        registrationStatus: RegistrationStatus.ONSALE, // Always start with ONSALE
      };

      console.log(
        'Final product request payload:',
        JSON.stringify(productRequest, null, 2)
      );
      console.log(
        'Verifying imageFileIds format - should contain encryptedIds:',
        productRequest.imageFileIds
      );
      let productResponse = await ProductService.createProduct(productRequest);

      // If creation fails with file ID, try without file ID and attach separately
      if (productResponse.error && productResponse.error.includes('파일 ID')) {
        console.log(
          'Product creation with file ID failed, trying without file ID...'
        );

        productRequest = {
          ...productRequest,
          imageFileIds: [], // Remove file IDs
        };

        productResponse = await ProductService.createProduct(productRequest);

        if (productResponse.error || !productResponse.data) {
          throw new Error(productResponse.error || 'Product creation failed');
        }

        const createdProduct = productResponse.data.data;
        console.log(
          'Product created successfully without file ID:',
          createdProduct
        );

        // Step 2: Attach the uploaded file to the product
        console.log('Attaching file to product using encryptedIds...');
        const attachResponse = await FileProductService.attachFiles(
          createdProduct.id,
          { fileIds: imageFileIds } // imageFileIds now contains encryptedIds
        );

        if (attachResponse.error) {
          console.error(
            'Failed to attach file to product:',
            attachResponse.error
          );
          throw new Error(
            `Failed to attach image to product: ${attachResponse.error}`
          );
        }

        console.log(
          'File attached to product successfully:',
          attachResponse.data
        );
      } else if (productResponse.error || !productResponse.data) {
        throw new Error(productResponse.error || 'Product creation failed');
      }

      const createdProduct = productResponse.data.data;
      console.log('Product created successfully:', createdProduct);

      // Step 3: Verify files are attached to the product
      console.log('Verifying files attached to product...');
      const entityFilesResponse = await FileProductService.getEntityFiles(
        createdProduct.id
      );
      if (entityFilesResponse.data) {
        console.log('Product files:', entityFilesResponse.data);
      } else {
        console.warn(
          'Could not retrieve product files:',
          entityFilesResponse.error
        );
      }

      // Step 4: Update product status if needed
      if (status === '품절') {
        console.log('Updating product status to SOLDOUT...');
        const statusResponse = await ProductService.markSoldOut(
          createdProduct.id
        );

        if (statusResponse.error) {
          console.warn(
            'Failed to update product status:',
            statusResponse.error
          );
          // Don't throw error here as product is already created
        } else {
          console.log('Product status updated to SOLDOUT successfully');
        }
      }

      setShowToast(true);
      // Navigate after a short delay to allow toast to be visible
      setTimeout(() => {
        router.push('/client/seller/pages/seller-product-list');
      }, 2000);
    } catch (error) {
      console.error('Product registration failed:', error);
      setError(
        error instanceof Error ? error.message : '상품 등록에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching store info and categories
  if (isLoadingStore || isLoadingCategories) {
    return (
      <>
        <h1 className={styles.registerTitle}>상품 등록하기</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          데이터를 불러오는 중...
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.registerTitle}>상품 등록하기</h1>
      {error && (
        <div
          key="form-error"
          style={{
            color: 'red',
            backgroundColor: '#ffe6e6',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #ffcccc',
          }}
        >
          {error}
        </div>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Multiple Image Upload */}
        <div className={styles.fileUploadWrapper}>
          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className={styles.hiddenFileInput}
            disabled={uploadedFiles.some((file) => file.isUploading)}
          />

          {/* Upload Button */}
          <div key="file-upload-label" className={styles.labelWrapper}>
            <CiImageOn size={16} color="rgba(0,0,0,0.4)" />
            <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
              사진 첨부하기 (여러 개 선택 가능)
            </label>
          </div>

          {/* Image Previews - positioned at bottom left */}
          {uploadedFiles.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '16px',
                justifyContent: 'flex-start',
                alignSelf: 'flex-start',
              }}
            >
              {uploadedFiles.map((file, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={file.preview}
                    alt={`preview-${index}`}
                    className={styles.imagePreview}
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0',
                    }}
                  />

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleFileDelete(index)}
                    disabled={file.isUploading}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: file.isUploading ? '#ccc' : '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: file.isUploading ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      zIndex: 1,
                    }}
                  >
                    <FaTimes size={10} />
                  </button>

                  {/* Upload Status Overlay */}
                  {file.isUploading && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        borderRadius: '8px',
                        gap: '4px',
                      }}
                    >
                      <div>업로드 중...</div>
                      {file.retryCount > 0 && (
                        <div style={{ fontSize: '10px', opacity: 0.8 }}>
                          재시도 {file.retryCount}/3
                        </div>
                      )}
                    </div>
                  )}

                  {/* Success Status */}
                  {file.encryptedId &&
                    !file.isUploading &&
                    !file.uploadError && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
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

                  {/* Error Status */}
                  {file.uploadError && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                      }}
                    >
                      ✗ 실패
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error Messages */}
          {uploadedFiles.some((file) => file.uploadError) && (
            <div
              style={{
                color: '#d32f2f',
                fontSize: '12px',
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#ffebee',
                borderRadius: '6px',
                border: '1px solid #ffcdd2',
              }}
            >
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                업로드 실패한 파일이 있습니다:
              </div>
              {uploadedFiles
                .filter((file) => file.uploadError)
                .map((file, index) => (
                  <div
                    key={index}
                    style={{ fontSize: '11px', marginLeft: '8px' }}
                  >
                    • {file.file.name}: {file.uploadError}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <label className={styles.label}>
          카테고리
          <div
            className={styles.customSelect}
            onClick={() => setCategoryOpen(!categoryOpen)}
          >
            <span>
              {selectedCategoryId
                ? categories.find((c) => c.categoryId === selectedCategoryId)
                    ?.categoryName || '카테고리를 선택해 주세요'
                : '카테고리를 선택해 주세요'}
            </span>
            {categoryOpen ? (
              <FaChevronUp color="rgba(0,0,0,0.4)" />
            ) : (
              <FaChevronDown color="rgba(0,0,0,0.4)" />
            )}
          </div>
          {categoryOpen && (
            <ul className={styles.customSelectList}>
              {categories.length === 0 ? (
                <li key="loading" className={styles.customSelectItem}>
                  카테고리를 불러오는 중...
                </li>
              ) : (
                categories.map((category) => (
                  <li
                    key={category.categoryId}
                    className={styles.customSelectItem}
                    onClick={() => {
                      console.log(
                        'Category selected:',
                        category.categoryName,
                        'ID:',
                        category.categoryId
                      );
                      setSelectedCategoryId(category.categoryId);
                      setCategoryOpen(false);
                    }}
                  >
                    {category.categoryName}
                  </li>
                ))
              )}
            </ul>
          )}
        </label>

        {/* Product Name Input */}
        <label className={styles.label}>
          상품명
          <input
            type="text"
            placeholder="상품명을 입력해 주세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
          />
        </label>

        {/* Description */}
        <label className={styles.label}>
          상세 설명
          <textarea
            placeholder="상품 상세 내용을 입력해 주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
          />
        </label>

        {/* Quantity */}
        <label className={styles.label}>
          수량
          <input
            type="number"
            placeholder="수량을 입력해 주세요"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={styles.input}
          />
        </label>

        {/* Cost Price */}
        <label className={styles.label}>
          원가
          <input
            type="number"
            placeholder="원가를 입력해 주세요"
            value={costPrice}
            onChange={(e) => setCostPrice(Number(e.target.value))}
            className={styles.input}
          />
        </label>

        {/* Sale Price */}
        <label className={styles.label}>
          최종 판매가
          <input
            type="number"
            placeholder="최종 가격을 입력해 주세요"
            value={salePrice}
            onChange={(e) => setSalePrice(Number(e.target.value))}
            className={styles.input}
          />
        </label>

        {/* Expiration */}
        <label className={styles.label}>
          유통기한
          <input
            type="date"
            placeholder="유통기한을 입력해 주세요"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            className={styles.input}
          />
        </label>

        {/* Status Dropdown */}
        <label className={styles.label}>
          등록 상태
          <div
            className={styles.customSelect}
            onClick={() => setStatusOpen(!statusOpen)}
          >
            <span>{status}</span>
            {statusOpen ? (
              <FaChevronUp color="rgba(0,0,0,0.4)" />
            ) : (
              <FaChevronDown color="rgba(0,0,0,0.4)" />
            )}
          </div>
          {statusOpen && (
            <ul className={styles.customSelectList}>
              {['판매중', '품절'].map((s) => (
                <li
                  key={s}
                  className={styles.customSelectItem}
                  onClick={() => {
                    setStatus(s as '판매중' | '품절');
                    setStatusOpen(false);
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </label>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? '등록 중...' : '등록하기'}
        </button>
      </form>

      {/* Toast shows after successful product registration */}
      {showToast && (
        <ToastMessage
          message="상품이 성공적으로 등록되었습니다."
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}

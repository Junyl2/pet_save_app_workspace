'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './RegisterProduct.module.css';
import { FaChevronDown, FaChevronUp, FaRedo } from 'react-icons/fa';
import { CiImageOn } from 'react-icons/ci';
import { FileProductService } from '@/app/api/services/client/productService/fileProductService';
import { ProductService } from '@/app/api/services/client/productService/productService';
import { StoreService } from '@/app/api/services/client/memberService/store';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import {
  ProductCreateRequest,
  RegistrationStatus,
} from '@/app/api/types/products/createProduct';
import { Category } from '@/app/api/types/category/category';

export default function RegisterProductForm() {
  const router = useRouter();

  const productNames = ['사료', '간식', '장난감', '목줄', '침대'];

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploadedFileEncryptedId, setUploadedFileEncryptedId] = useState<
    string | null
  >(null);
  const [imageFileIds, setImageFileIds] = useState<string[]>([]); // Stores encryptedIds, not fileIds
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Fetch store information and categories on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch store information
        console.log('Fetching store information...');
        const storeResponse = await StoreService.getMyStore();

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

  // Update preview when a file is selected
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

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

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploadedFileId(null);
    setUploadedFileEncryptedId(null);
    setImageFileIds([]); // Clear previous file IDs

    // Start immediate upload
    setIsUploading(true);
    try {
      console.log('Starting immediate file upload...');
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
      setUploadedFileId(uploadedFile.fileId);
      setUploadedFileEncryptedId(uploadedFile.encryptedId);

      // Update imageFileIds state with the encrypted ID (backend expects this)
      setImageFileIds([uploadedFile.encryptedId]);

      console.log('File uploaded successfully:', uploadedFile);
      console.log('Uploaded file details:', {
        fileId: uploadedFile.fileId,
        encryptedId: uploadedFile.encryptedId,
        filename: uploadedFile.filename,
        originalFilename: uploadedFile.originalFilename,
        isAttached: uploadedFile.isAttached,
        entityType: uploadedFile.entityType,
        entityId: uploadedFile.entityId,
      });
      console.log('Updated imageFileIds state with encryptedId:', [
        uploadedFile.encryptedId,
      ]);

      // Wait a moment for file processing on backend
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('File upload failed:', error);
      setUploadError(
        error instanceof Error ? error.message : '파일 업로드에 실패했습니다.'
      );
      // Clear file IDs on error
      setImageFileIds([]);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection and immediate upload
  const handleFileSelect = async (file: File | null) => {
    setImageFile(file);

    if (!file) {
      setImagePreview(null);
      setUploadError(null);
      setUploadedFileId(null);
      setUploadedFileEncryptedId(null);
      setImageFileIds([]); // Clear file IDs when no file selected
      return;
    }

    await handleFileUpload(file);
  };

  // Handle retry upload
  const handleRetryUpload = async () => {
    if (imageFile) {
      await handleFileUpload(imageFile);
    }
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
      if (!imageFile) {
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
      if (!uploadedFileId || !uploadedFileEncryptedId) {
        setError(
          '이미지 업로드가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.'
        );
        return;
      }
      if (isUploading) {
        setError('이미지 업로드 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      if (uploadError) {
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

      console.log('Using already uploaded file:', uploadedFileId);
      console.log('Using encrypted ID:', uploadedFileEncryptedId);
      console.log(
        'Using imageFileIds (encryptedIds) for product creation:',
        imageFileIds
      );

      // Verify file info using encryptedId
      console.log('Getting file info to verify...');
      const fileInfoResponse = await FileProductService.getFileInfo(
        uploadedFileEncryptedId
      );
      if (fileInfoResponse.data) {
        console.log('File info retrieved successfully:', fileInfoResponse.data);
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
        throw new Error(`File verification failed: ${fileInfoResponse.error}`);
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

      alert('상품이 성공적으로 등록되었습니다.');
      router.push('/client/seller/pages/seller-product-list');
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
        {/* Image Upload */}
        <div className={styles.fileUploadWrapper}>
          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className={styles.hiddenFileInput}
            disabled={isUploading}
          />

          {imagePreview ? (
            <div key="image-preview" style={{ position: 'relative' }}>
              <img
                src={imagePreview}
                alt="preview"
                className={styles.imagePreview}
              />
              {isUploading && (
                <div
                  key="uploading-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                  }}
                >
                  업로드 중...
                </div>
              )}
              {uploadedFileId && !isUploading && imageFileIds.length > 0 && (
                <div
                  key="upload-success"
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '12px',
                  }}
                >
                  ✓ 업로드 완료
                </div>
              )}
              {uploadError && (
                <div
                  key="upload-error"
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ✗ 업로드 실패
                </div>
              )}
            </div>
          ) : (
            <div key="file-upload-label" className={styles.labelWrapper}>
              <CiImageOn size={16} color="rgba(0,0,0,0.4)" />
              <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
                {isUploading ? '업로드 중...' : '사진 첨부하기'}
              </label>
            </div>
          )}

          {uploadError && (
            <div
              key="upload-error-message"
              style={{
                color: '#d32f2f',
                fontSize: '12px',
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#ffebee',
                borderRadius: '6px',
                border: '1px solid #ffcdd2',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontWeight: '500' }}>
                업로드 실패: {uploadError}
              </div>
              <button
                type="button"
                onClick={handleRetryUpload}
                disabled={isUploading}
                className={styles.retryButton}
              >
                <FaRedo size={12} style={{ marginRight: '4px' }} />
                {isUploading ? '재시도 중...' : '다시 시도'}
              </button>
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

        {/* Product Name Dropdown */}
        <label className={styles.label}>
          상품명
          <div
            className={styles.customSelect}
            onClick={() => setNameOpen(!nameOpen)}
          >
            <span>{name || '상품명을 선택해 주세요'}</span>
            {nameOpen ? (
              <FaChevronUp color="rgba(0,0,0,0.4)" />
            ) : (
              <FaChevronDown color="rgba(0,0,0,0.4)" />
            )}
          </div>
          {nameOpen && (
            <ul className={styles.customSelectList}>
              {productNames.map((p) => (
                <li
                  key={p}
                  className={styles.customSelectItem}
                  onClick={() => {
                    setName(p);
                    setNameOpen(false);
                  }}
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
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
    </>
  );
}

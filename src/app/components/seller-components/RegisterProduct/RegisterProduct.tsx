'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './RegisterProduct.module.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { CiImageOn } from 'react-icons/ci';

export default function RegisterProductForm() {
  const router = useRouter();

  const categories = ['강아지', '고양이', '햄스터', '새', '고슴도치'];
  const productNames = ['사료', '간식', '장난감', '목줄', '침대'];

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [expiration, setExpiration] = useState('');
  const [status, setStatus] = useState<'판매중' | '품절'>('판매중');

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) return alert('이미지를 첨부해주세요');
    if (!category) return alert('카테고리를 선택해주세요');
    if (!name) return alert('상품명을 입력해주세요');
    if (!description) return alert('상세 내용을 입력해주세요');
    if (!quantity) return alert('수량을 입력해주세요');
    if (!costPrice) return alert('원가를 입력해주세요');
    if (!salePrice) return alert('판매가를 입력해주세요');
    if (!expiration) return alert('유통기한을 입력해주세요');

    console.log({
      imageFile,
      category,
      name,
      description,
      quantity,
      costPrice,
      salePrice,
      expiration,
      status,
    });

    alert('상품이 등록되었습니다.');
    router.push('/seller');
  };

  return (
    <>
      <h1 className={styles.registerTitle}>상품 등록하기</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className={styles.fileUploadWrapper}>
          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className={styles.hiddenFileInput}
          />

          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              className={styles.imagePreview}
            />
          ) : (
            <div className={styles.labelWrapper}>
              <CiImageOn size={16} color="rgba(0,0,0,0.4)" />
              <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
                사진 첨부하기
              </label>
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
            <span>{category || '카테고리를 선택해 주세요'}</span>
            {categoryOpen ? (
              <FaChevronUp color="rgba(0,0,0,0.4)" />
            ) : (
              <FaChevronDown color="rgba(0,0,0,0.4)" />
            )}
          </div>
          {categoryOpen && (
            <ul className={styles.customSelectList}>
              {categories.map((c) => (
                <li
                  key={c}
                  className={styles.customSelectItem}
                  onClick={() => {
                    setCategory(c);
                    setCategoryOpen(false);
                  }}
                >
                  {c}
                </li>
              ))}
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

        <button type="submit" className={styles.submitButton}>
          등록하기
        </button>
      </form>
    </>
  );
}

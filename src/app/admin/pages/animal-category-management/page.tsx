'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPlus } from 'react-icons/fi';
import styles from './AnimalCategory.module.css';
import OrderPagination from '@/app/components/admin/ui/OrderPagination/OrderPagination';
import { usePageParam } from '@/app/components/ui/Pagination/usePageParam';
import { CategoryService } from '@/app/api/services/client/categoryService/categoryService';
import { Category } from '@/app/api/types/category/category';

const PAGE_SIZE = 10;

export default function AnimalCategoryPage() {
  const router = useRouter();
  const { page, setPage } = usePageParam(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await CategoryService.getAllCategories({
          page: page - 1,
          size: PAGE_SIZE,
          keyword: keyword.trim() || undefined,
          sortBy: 'createdAt',
          direction: 'desc',
        });

        if (response.error || !response.data?.success) {
          console.error('❌ Failed to fetch categories:', response.error);
          setCategories([]);
          return;
        }

        const result = response.data.data;
        setCategories(result.content);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchCategories();
  }, [page, keyword]);

  const openEditCategory = (category: Category) => {
    const query = new URLSearchParams({
      image: category.image ?? '',
      type: category.categoryName,
      situation: category.visible ? '표시 중' : '숨김',
    }).toString();

    router.push(
      `/admin/pages/animal-category-management/edit-category/${category.categoryId}?${query}`
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(keyword.trim());
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>동물 카테고리 관리</h1>
        <h2 className={styles.subTitle}>카테고리 목록</h2>
      </div>

      <div className={styles.wrapper}>
        {/* Top Header: Add + Search */}
        <div className={styles.topHeader}>
          <button
            type="button"
            className={styles.addCategoryBtn}
            onClick={() =>
              router.push(
                '/admin/pages/animal-category-management/add-category'
              )
            }
          >
            <FiPlus size={16} className={styles.plusIcon} />
            <span>카테고리 추가</span>
          </button>

          <form className={styles.searchWrap} onSubmit={handleSearch}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="검색어를 입력하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn}>
              검색
            </button>
          </form>
        </div>

        <div className={styles.headerRow}>
          <div className={styles.col}>아이콘 이미지</div>
          <div className={styles.col}>분류</div>
          <div className={styles.col}>상태</div>
        </div>

        {loading && <div className={styles.loading}>불러오는 중...</div>}

        {!loading && categories.length === 0 && (
          <div className={styles.empty}>등록된 카테고리가 없습니다.</div>
        )}

        {!loading &&
          categories.map((cat) => (
            <div key={cat.categoryId} className={styles.dataRow}>
              <div className={`${styles.col} ${styles.image}`}>
                <Image
                  src={
                    cat.image && cat.image.startsWith('http')
                      ? cat.image
                      : '/images/icons/icon.png'
                  }
                  height={45}
                  width={45}
                  alt={cat.categoryName}
                />
              </div>
              <div className={styles.col}>{cat.categoryName}</div>
              <div className={styles.col}>
                {cat.visible ? '표시 중' : '숨김'}
              </div>
              <div className={styles.actions}>
                <button className={styles.hideBtn}>
                  {cat.visible ? '숨김 전환' : '표시 전환'}
                </button>
                <button
                  className={styles.editBtn}
                  onClick={() => openEditCategory(cat)}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    openEditCategory(cat)
                  }
                >
                  수정하기
                </button>
              </div>
            </div>
          ))}
      </div>

      {totalPages > 1 && (
        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}
        >
          <div style={{ width: 320 }}>
            <OrderPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './SearchProductGrid.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';
import { CartModal } from '../../ui/modal/CartModal/CartModal';
import { toast } from 'react-hot-toast';
import { Product } from '@/app/api/types/products/products';
import { productService } from '@/app/api/services/product-service/productService';
import SearchProductSkeleton from './SearchProductSkeleton';

export default function SearchProductGrid({
  searchTerm = '',
  onSearchSubmit,
}: {
  searchTerm?: string;
  onSearchSubmit?: () => void;
}) {
  const { favorites } = useFavorites();
  const router = useRouter();

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('정확도순');

  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Full catalog for wrong-term detection
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [catalogReady, setCatalogReady] = useState(false);

  // Load full catalog once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await productService.getAll();
        if (!mounted) return;
        setAllProducts(res?.error ? [] : res?.data || []);
      } catch {
        if (!mounted) return;
        setAllProducts([]);
      } finally {
        if (!mounted) return;
        setCatalogReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch products based on search term
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      setProducts([]);
      setError(null);

      try {
        const res = searchTerm.trim()
          ? await productService.search(searchTerm)
          : await productService.getAll();

        if (!isMounted) return;

        if (res?.error) {
          setError(res.error);
          setProducts([]);
        } else {
          setProducts(res?.data || []);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || '알 수 없는 오류가 발생했습니다.');
        setProducts([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  // Sorting
  const filteredProducts = useMemo(() => {
    if (selectedSort === '낮은 가격순') {
      return [...products].sort((a, b) => {
        const priceA = Number(
          a.discountPrice?.replace(/,/g, '').replace('원', '') ||
            a.price.replace(/,/g, '').replace('원', '')
        );
        const priceB = Number(
          b.discountPrice?.replace(/,/g, '').replace('원', '') ||
            b.price.replace(/,/g, '').replace('원', '')
        );
        return priceA - priceB;
      });
    }
    return products;
  }, [products, selectedSort]);

  // UI handlers
  const handleSortToggle = () => setDropdownOpen(!isDropdownOpen);
  const handleSelectSort = (option: string) => {
    setSelectedSort(option);
    setDropdownOpen(false);
  };
  const handleCartClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setCartOpen(true);
  };
  const handleProductClick = (product: Product) => {
    router.push(`/products/${product.id}`);
  };
  const handleSearchSubmit = () => {
    setSearchSubmitted(true);
    if (!searchTerm.trim()) {
      toast.error('검색어를 입력해주세요.');
      return;
    }
    onSearchSubmit?.();
  };

  // Empty states
  const isEmptySearch = !searchTerm.trim() && searchSubmitted;
  const noMatches = !!searchTerm.trim() && filteredProducts.length === 0;

  // Wrong-term detection (only after catalog is ready)
  const normalizedTerm = searchTerm.trim().toLowerCase();
  const matchesAnyCatalog = useMemo(() => {
    if (!normalizedTerm) return false;
    if (!catalogReady || allProducts.length === 0) return false;

    // 🔑 strip numbers/symbols so "강아지123" still matches "강아지"
    const cleanTerm = normalizedTerm.replace(/[^가-힣a-zA-Z]/g, '');

    return allProducts.some((p) =>
      (p.name || '').toLowerCase().includes(cleanTerm)
    );
  }, [allProducts, catalogReady, normalizedTerm]);

  // ---- render ----
  if (loading) {
    return (
      <section className={styles.mainContainer}>
        <SearchProductSkeleton count={6} />
      </section>
    );
  }

  if (error) return <p className={styles.emptyText}>에러: {error}</p>;

  // Empty input submitted
  if (isEmptySearch) {
    return (
      <div className={styles.emptyContainer}>
        <div>
          <Image
            src="/images/products/noresult.png"
            alt="검색어 입력 필요"
            height={100}
            width={100}
            className="object-contain"
          />
          <p className={styles.emptyText}>검색어를 입력해주세요.</p>
        </div>
      </div>
    );
  }

  // Unified no-results branch
  if (noMatches) {
    const isWrongTerm =
      catalogReady && allProducts.length > 0 && !matchesAnyCatalog;

    return (
      <div className={styles.emptyContainer}>
        <div>
          <Image
            src={
              isWrongTerm
                ? '/images/products/noresult-wrong-term.svg'
                : '/images/products/noresult.png'
            }
            alt="검색된 상품 없음"
            height={100}
            width={100}
            className="object-contain"
          />
          <p className={styles.emptyText}>검색된 상품이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.mainContainer}>
      {filteredProducts.length > 0 && (
        <div className={styles.filterBar}>
          <span className={styles.totalCount}>
            총 상품수 {filteredProducts.length}개
          </span>
          <div className={styles.sortDropdown}>
            <button className={styles.sortBtn} onClick={handleSortToggle}>
              {selectedSort}{' '}
              {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdownContent}>
                {[
                  '정확도순',
                  '판매 인기순',
                  '최신 등록순',
                  '낮은 가격순',
                  '높은 가격순',
                  '높은 할인율',
                ].map((option) => (
                  <button key={option} onClick={() => handleSelectSort(option)}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={styles.card}
            onClick={() => handleProductClick(product)}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={product.image}
                alt={product.name}
                width={162}
                height={147}
                className={styles.image}
              />
              <div className={styles.icons}>
                <button
                  className={styles.iconBtn}
                  onClick={(e) => handleCartClick(e, product)}
                >
                  <Image
                    src="/images/icons/Cart.png"
                    alt="Cart Icon"
                    width={24}
                    height={22}
                    className="object-contain"
                  />
                </button>
              </div>
            </div>
            <div className={styles.content}>
              <div className={styles.header}>
                <h3 className={styles.name}>{product.name}</h3>
              </div>
              <p className={styles.detail}>
                {product.weight}, {product.quantity}
              </p>
              <p className={styles.price}>
                {product.discountPrice ? (
                  <>
                    <span className={styles.original}>{product.price}</span>
                    <span className={styles.discount}>
                      {product.discountPrice}
                    </span>
                  </>
                ) : (
                  product.price
                )}
              </p>
              <p className={styles.info}>
                {product.expiration} <br />
                {product.location} <br />
                {product.distance}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <CartModal
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          productName={selectedProduct.name}
          productPrice={Number(
            (selectedProduct.discountPrice || selectedProduct.price)
              .replace(/,/g, '')
              .replace('원', '')
          )}
        />
      )}
    </section>
  );
}

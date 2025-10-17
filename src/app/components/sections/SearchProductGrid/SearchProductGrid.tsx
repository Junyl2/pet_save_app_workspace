'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './SearchProductGrid.module.css';
/* import { useFavorites } from '@/app/context/FavoritesContext'; */
import { CartModal } from '../../ui/modal/CartModal/CartModal';
import {
  Product,
  ProductSearchParams,
} from '@/app/api/types/products/products';
import { ProductService } from '@/app/api/services/client/productService/productService';
import SearchProductSkeleton from './SearchProductSkeleton';
import SearchState from '../../ui/SearchResult/SearchState';

export default function SearchProductGrid({
  searchTerm = '',
}: /*  onSearchSubmit, */
{
  searchTerm?: string;
  onSearchSubmit?: () => void;
}) {
  /*  const {  toggleFavorite, isFavorited } = useFavorites(); */
  const router = useRouter();

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('정확도순');
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  /*   const [searchSubmitted, setSearchSubmitted] = useState(false); */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [catalogReady, setCatalogReady] = useState(false);

  // Load full catalog once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const searchParams: ProductSearchParams = {
          registrationStatus: 'ONSALE',
          page: 0,
          size: 100,
          sortBy: 'createdAt',
          direction: 'desc',
        };
        const res = await ProductService.searchProducts(searchParams);
        if (!mounted) return;
        setAllProducts(res?.error ? [] : res?.data?.data?.content || []);
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
        const searchParams: ProductSearchParams = {
          keyword: searchTerm.trim() || undefined,
          registrationStatus: 'ONSALE',
          page: 0,
          size: 50,
          sortBy: 'createdAt',
          direction: 'desc',
        };

        const res = await ProductService.searchProducts(searchParams);

        if (!isMounted) return;

        if (res?.error) {
          setError(res.error);
          setProducts([]);
        } else {
          setProducts(res?.data?.data?.content || []);
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
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
        const priceA = a.discountedPrice ?? a.salePrice ?? a.price ?? 0;
        const priceB = b.discountedPrice ?? b.salePrice ?? b.price ?? 0;
        return priceA - priceB;
      });
    } else if (selectedSort === '높은 가격순') {
      return [...products].sort((a, b) => {
        const priceA = a.discountedPrice ?? a.salePrice ?? a.price ?? 0;
        const priceB = b.discountedPrice ?? b.salePrice ?? b.price ?? 0;
        return priceB - priceA;
      });
    }
    return products;
  }, [products, selectedSort]);

  // Handlers
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
    const productId = product.productId || product.id;
    if (productId) {
      router.push(`/client/pages/products/${productId}`);
    } else {
      console.error('Product missing ID:', product);
    }
  };

  /* const handleSearchSubmit = () => {
    setSearchSubmitted(true);
    if (!searchTerm.trim()) {
      toast.error('검색어를 입력해주세요.');
      return;
    }
    onSearchSubmit?.();
  }; */

  // States
  const isEmptySearch = !searchTerm.trim(); /* && searchSubmitted; */
  const noMatches = !!searchTerm.trim() && filteredProducts.length === 0;

  const normalizedTerm = searchTerm.trim().toLowerCase();
  const matchesAnyCatalog = useMemo(() => {
    if (!normalizedTerm) return false;
    if (!catalogReady || allProducts.length === 0) return false;
    const cleanTerm = normalizedTerm.replace(/[^가-힣a-zA-Z]/g, '');
    return allProducts.some((p) =>
      (p.name || '').toLowerCase().includes(cleanTerm)
    );
  }, [allProducts, catalogReady, normalizedTerm]);

  // ---- render ----
  if (loading) return <SearchProductSkeleton count={6} />;

  if (error)
    return (
      <SearchState
        imageSrc="/images/products/noresult.png"
        altText="검색 에러"
        message={`에러: ${error}`}
      />
    );

  if (isEmptySearch)
    return (
      <SearchState
        imageSrc="/images/products/noresult.png"
        altText="검색어 입력 필요"
        message="검색어를 입력해주세요."
      />
    );

  if (noMatches) {
    const isWrongTerm =
      catalogReady && allProducts.length > 0 && !matchesAnyCatalog;
    return (
      <SearchState
        imageSrc={
          isWrongTerm
            ? '/images/products/noresult-wrong-term.svg'
            : '/images/products/noresult.png'
        }
        altText="검색된 상품 없음"
        message={
          isWrongTerm
            ? '검색어가 올바르지 않습니다.'
            : '검색된 상품이 없습니다.'
        }
      />
    );
  }

  return (
    <>
      {/*   <div className={styles.divider}></div> */}
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
                    <button
                      key={option}
                      onClick={() => handleSelectSort(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.grid}>
          {filteredProducts.map((product) => {
            const productId = product.productId || product.id;
            return (
              <div
                key={productId}
                className={styles.card}
                onClick={() => handleProductClick(product)}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={
                      product.image || product.thumbnail || '/placeholder.png'
                    }
                    alt={product.name || product.productName || 'Product'}
                    width={162}
                    height={147}
                    className={styles.image}
                    unoptimized={(
                      product.image ||
                      product.thumbnail ||
                      ''
                    ).includes('211.107.13.167')}
                  />
                  <div className={styles.icons}>
                    <button
                      className={styles.iconBtn}
                      onClick={(e) => handleCartClick(e, product)}
                    >
                      <Image
                        src="/images/products/search-cart.svg"
                        alt="Cart Icon"
                        width={26}
                        height={26}
                        className="object-contain"
                      />
                    </button>
                    {/*    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const productId = product.productId || product.id;
                        if (productId) {
                          await toggleFavorite(productId.toString());
                        }
                      }}
                      className={styles.iconBtn}
                    >
                      <Image
                        src={
                          isFavorited(
                            (product.productId || product.id)?.toString() || ''
                          )
                            ? '/images/products/heart-active.png'
                            : '/images/products/heart-default.png'
                        }
                        alt="Heart Icon"
                        width={24}
                        height={22}
                        className="object-contain"
                      />
                    </button> */}
                  </div>
                </div>
                <div className={styles.content}>
                  <div className={styles.header}>
                    <h3 className={styles.name}>{product.name}</h3>
                  </div>
                  <p className={styles.detail}>
                    {product.weight || product.productWeight || 'N/A'},{' '}
                    {product.quantity || product.productQuantity || 'N/A'}
                  </p>
                  <p className={styles.price}>
                    {(() => {
                      const higherPrice =
                        product.salePrice ||
                        product.price ||
                        product.originalPrice ||
                        product.regularPrice ||
                        product.productPrice;
                      const lowerPrice =
                        product.discountedPrice || product.discountPrice;

                      if (
                        higherPrice &&
                        lowerPrice &&
                        higherPrice !== lowerPrice
                      ) {
                        return (
                          <>
                            <span className={styles.original}>
                              {higherPrice.toLocaleString('ko-KR')}원
                            </span>
                            <span className={styles.discount}>
                              {lowerPrice.toLocaleString('ko-KR')}원
                            </span>
                          </>
                        );
                      } else if (higherPrice || lowerPrice) {
                        const priceToShow = higherPrice || lowerPrice || 0;
                        return `${priceToShow.toLocaleString('ko-KR')}원`;
                      } else {
                        return '0원';
                      }
                    })()}
                  </p>

                  <p className={styles.info}>
                    {product.expiryDate
                      ? new Date(product.expiryDate).toLocaleDateString(
                          'ko-KR'
                        ) + '까지'
                      : product.expiration || 'N/A'}{' '}
                    <br />
                    {product.store?.name || product.location || 'N/A'} <br />
                    {product.distance || product.storeDistance || 'N/A'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/*  {selectedProduct && (
          <CartModal
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            product={selectedProduct}
          />
        )} */}
        {selectedProduct && (
          <CartModal
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            productName={selectedProduct.name || 'Product'}
            productPrice={(() => {
              const lowerPrice =
                selectedProduct.discountedPrice ||
                selectedProduct.discountPrice;
              const higherPrice =
                selectedProduct.salePrice ||
                selectedProduct.price ||
                selectedProduct.originalPrice ||
                selectedProduct.regularPrice ||
                selectedProduct.productPrice;
              return lowerPrice || higherPrice || 0;
            })()}
            productId={String(selectedProduct.productId || selectedProduct.id)}
            storeId={String(
              selectedProduct.storeId || selectedProduct.store?.storeId
            )}
          />
        )}
      </section>
    </>
  );
}

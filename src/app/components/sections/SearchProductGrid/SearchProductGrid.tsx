'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './SearchProductGrid.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';
import { CartModal } from '../../ui/modal/CartModal/CartModal';
import { toast } from 'react-hot-toast';

type Product = {
  id: number;
  name: string;
  weight: string;
  quantity: string;
  price: string;
  discountPrice?: string;
  expiration: string;
  location: string;
  distance: string;
  category: string;
  image: string;
};

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Dog Food',
    weight: '2kg',
    quantity: '5개',
    price: '25,000원',
    discountPrice: '20,000원',
    expiration: '25.12.01까지',
    location: '서울특별시 신림동',
    distance: '2km',
    category: '강아지',
    image: '/images/products/dogfood.png',
  },
  {
    id: 2,
    name: 'Dog Food Premium',
    weight: '3kg',
    quantity: '3개',
    price: '35,000원',
    discountPrice: '30,000원',
    expiration: '25.12.10까지',
    location: '서울특별시 강남',
    distance: '5km',
    category: '강아지',
    image: '/images/products/dogfood.png',
  },
  {
    id: 3,
    name: 'Cat Toy',
    weight: '200g',
    quantity: '10개',
    price: '5,000원',
    expiration: '26.01.01까지',
    location: '부산광역시',
    distance: '5km',
    category: '고양이',
    image: '/images/products/cat-toy.jpg',
  },
];

export default function ProductGrid({
  searchTerm = '',
  onSearchSubmit,
}: {
  searchTerm?: string;
  onSearchSubmit?: () => void;
}) {
  const { favorites } = useFavorites();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('정확도순');

  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchSubmitted, setSearchSubmitted] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return mockProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSortToggle = () => setDropdownOpen(!isDropdownOpen);

  const handleSelectSort = (option: string) => {
    setSelectedSort(option);
    setDropdownOpen(false);
    // TODO: Implement sorting logic
  };

  const handleCartClick = (product: Product) => {
    setSelectedProduct(product);
    setCartOpen(true);
  };

  const handleSearchSubmit = () => {
    setSearchSubmitted(true);
    if (!searchTerm.trim()) {
      toast.error('검색어를 입력해주세요.');
      return;
    }
    if (onSearchSubmit) onSearchSubmit();
  };

  const isEmptySearch = !searchTerm.trim() && searchSubmitted;
  const noMatches = searchTerm.trim() && filteredProducts.length === 0;

  // -------------------------
  // EMPTY INPUT SUBMITTED
  // -------------------------
  if (isEmptySearch) {
    return (
      <div className={styles.emptyContainer}>
        <div>
          <Image
            src="/images/products/noresult-empty.png"
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

  // -------------------------
  // WRONG SEARCH TERM (random text, no product)
  // -------------------------
  if (
    noMatches &&
    !mockProducts.some((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase().replace(/s$/, ''))
    )
  ) {
    return (
      <div className={styles.emptyContainer}>
        <div>
          <Image
            src="/images/products/noresult-wrong-term.svg"
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

  // -------------------------
  // NO RESULTS FOR VALID TERM
  // -------------------------
  if (noMatches) {
    return (
      <div className={styles.emptyContainer}>
        <div>
          <Image
            src="/images/products/noresult.png"
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

  // -------------------------
  // PRODUCT GRID
  // -------------------------
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
          <div key={product.id} className={styles.card}>
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
                  onClick={() => handleCartClick(product)}
                >
                  <Image
                    src="/images/products/search-cart.svg"
                    alt="Cart Icon"
                    width={26}
                    height={26}
                    className="object-contain"
                  />
                </button>
              </div>
            </div>
            <div className={styles.content}>
              <h3 className={styles.name}>{product.name}</h3>
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

'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import styles from './ProductGrid.module.css';
import { useFavorites } from '@/app/context/FavoritesContext';

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
  // 강아지
  {
    id: 1,
    name: '6free 강아지 사료 치킨 레시피',
    weight: '6kg',
    quantity: '1개',
    price: '30,000원',
    discountPrice: '24,000원',
    expiration: '25.10.10까지',
    location: '서울특별시 신림동',
    distance: '10km',
    category: '강아지',
    image: '/images/products/dogfood.png',
  },
  {
    id: 2,
    name: '강아지 간식 치즈볼',
    weight: '500g',
    quantity: '2개',
    price: '15,000원',
    discountPrice: '12,000원',
    expiration: '25.12.01까지',
    location: '서울특별시 강남구',
    distance: '12km',
    category: '강아지',
    image: '/images/products/dog-snack.png',
  },
  {
    id: 3,
    name: '강아지 간식 치즈볼',
    weight: '500g',
    quantity: '2개',
    price: '15,000원',
    discountPrice: '12,000원',
    expiration: '25.12.01까지',
    location: '서울특별시 강남구',
    distance: '12km',
    category: '강아지',
    image: '/images/products/dog-snack.png',
  },
  {
    id: 4,
    name: '강아지 간식 치즈볼',
    weight: '500g',
    quantity: '2개',
    price: '15,000원',
    discountPrice: '12,000원',
    expiration: '25.12.01까지',
    location: '서울특별시 강남구',
    distance: '12km',
    category: '강아지',
    image: '/images/products/dog-snack.png',
  },

  // 고양이
  {
    id: 5,
    name: '고양이 사료 참치 레시피',
    weight: '4kg',
    quantity: '1개',
    price: '28,000원',
    discountPrice: '23,000원',
    expiration: '25.10.10까지',
    location: '서울특별시 신림동',
    distance: '10km',
    category: '고양이',
    image: '/images/products/cat-food.png',
  },
  {
    id: 6,
    name: '고양이 간식 연어 스틱',
    weight: '300g',
    quantity: '3개',
    price: '12,000원',
    discountPrice: '10,000원',
    expiration: '25.11.20까지',
    location: '서울특별시 마포구',
    distance: '8km',
    category: '고양이',
    image: '/images/products/cat-snack.png',
  },

  // 햄스터
  {
    id: 7,
    name: '햄스터 사료 혼합곡',
    weight: '500g',
    quantity: '1개',
    price: '8,000원',
    expiration: '25.09.30까지',
    location: '서울특별시 동작구',
    distance: '5km',
    category: '햄스터',
    image: '/images/products/hamster-food.png',
  },
  {
    id: 8,
    name: '햄스터 간식 해바라기씨',
    weight: '200g',
    quantity: '1개',
    price: '5,000원',
    expiration: '25.10.15까지',
    location: '서울특별시 서초구',
    distance: '7km',
    category: '햄스터',
    image: '/images/products/hamster-snack.png',
  },

  // 새
  {
    id: 9,
    name: '새 모이 혼합',
    weight: '1kg',
    quantity: '1개',
    price: '10,000원',
    expiration: '25.12.31까지',
    location: '서울특별시 용산구',
    distance: '15km',
    category: '새',
    image: '/images/products/bird-food.png',
  },
  {
    id: 10,
    name: '새 간식 과일칩',
    weight: '300g',
    quantity: '1개',
    price: '6,000원',
    expiration: '25.11.30까지',
    location: '서울특별시 강서구',
    distance: '20km',
    category: '새',
    image: '/images/products/bird-snack.png',
  },

  // 고슴도치
  {
    id: 11,
    name: '고슴도치 사료 건조밀',
    weight: '500g',
    quantity: '1개',
    price: '14,000원',
    expiration: '25.10.20까지',
    location: '서울특별시 송파구',
    distance: '10km',
    category: '고슴도치',
    image: '/images/products/hedgehog-food.png',
  },
  {
    id: 12,
    name: '고슴도치 간식 밀웜',
    weight: '200g',
    quantity: '1개',
    price: '7,000원',
    expiration: '25.12.01까지',
    location: '서울특별시 노원구',
    distance: '12km',
    category: '고슴도치',
    image: '/images/products/hedgehog-snack.png',
  },
];

export default function ProductGrid({ category }: { category: string }) {
  const filteredProducts = useMemo(
    () => mockProducts.filter((p) => p.category === category),
    [category]
  );

  const { favorites, toggleFavorite } = useFavorites();

  if (filteredProducts.length === 0) {
    return <p className={styles.empty}>해당 카테고리의 상품이 없습니다.</p>;
  }

  return (
    <section className={styles.mainContainer}>
      <div className={styles.grid}>
        {filteredProducts.map((product) => {
          const isFavorited = favorites.includes(product.id);

          return (
            <div key={product.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={120}
                  height={120}
                  className={styles.image}
                />
              </div>
              <div className={styles.content}>
                <div className={styles.header}>
                  <h3 className={styles.name}>{product.name}</h3>
                  <div className={styles.icons}>
                    <button className={styles.iconBtn}>
                      <Image
                        src={'/images/icons/Cart.png'}
                        alt="Heart Icon"
                        width={24}
                        height={22}
                        className="object-contain"
                      />
                    </button>
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className={styles.iconBtn}
                    >
                      <Image
                        src={
                          isFavorited
                            ? '/images/products/heart-active.png'
                            : '/images/products/heart-default.png'
                        }
                        alt="Heart Icon"
                        width={24}
                        height={22}
                        className="object-contain"
                      />
                    </button>
                  </div>
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
          );
        })}
      </div>
    </section>
  );
}

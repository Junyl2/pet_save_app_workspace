'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Seller } from '@/app/api/types/seller/seller';
import { sellerService } from '@/app/api/services/serller-details/sellerService';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { ProductGrid } from '@/app/components/sections/ProductGrid/ProductGrid';
import CategoryNav from '@/app/components/sections/TopBar/CategoryNav/CategoryNav';
import styles from './Seller.module.css';
import { DotMenu } from '@/app/components/ui/DotMenu/DotMenu';
import { IoLocationOutline } from 'react-icons/io5';
import { LuAlarmClock } from 'react-icons/lu';
import { IoCallOutline } from 'react-icons/io5';
import { FaStar } from 'react-icons/fa6';
import { BsBoxSeam } from 'react-icons/bs';
import Loading from '@/app/components/ui/Loading/Loading';

export default function SellerDetailsPage() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    sellerService.getSellerDetails().then((data) => {
      setSeller(data);
      const firstCategory = data.products[0]?.category || '';
      setSelectedCategory(firstCategory);
    });
  }, []);

  if (!seller) return <Loading />;

  const profileImage =
    seller.products[0]?.shopImage || '/images/default-shop.png';
  const categories = Array.from(
    new Set(seller.products.map((p) => p.category))
  );

  return (
    <>
      <ProductHeader />
      <div className={styles.container}>
        <div className={styles.profileDetails}>
          <DotMenu />

          {profileImage && (
            <div className={styles.profileWrapper}>
              <img
                src={profileImage}
                alt={seller.name}
                className={styles.profileImage}
              />
              <h1 className={styles.sellerName}>{seller.name}</h1>
            </div>
          )}
          <div className={styles.sellerMoreDetails}>
            <div className={styles.details}>
              <IoCallOutline size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.phone}>{seller.phoneNumber}</p>
              <button
                className={styles.callButton}
                onClick={() => alert(`Calling ${seller.phoneNumber}`)}
              >
                전화 연결
              </button>
            </div>
            <div className={styles.details}>
              <LuAlarmClock size={18} color="rgba(0,0,0,0.8)" />
              <p className={styles.workingHours}>{seller.workingHours}</p>
            </div>
            <div className={styles.details}>
              <IoLocationOutline size={18} color="rgba(0,0,0,0.8)" />

              <p className={styles.location}>{seller.location}</p>
            </div>
          </div>
        </div>
        <div className={styles.divider}></div>
        {/* products and reviews */}
        <div className={styles.titleReview}>
          <p className={styles.review}>
            <span className={styles.reviewLabel}>등록된 상품</span>
            <span className={styles.reviewQuantity}>
              <BsBoxSeam size={16} color="#B5DB58" />
              {seller.reviewCount} 개
            </span>
          </p>
          <div className={styles.separator}></div>

          <p className={styles.review}>
            <span className={styles.reviewLabel}>리뷰</span>
            <span className={styles.reviewQuantity}>
              <FaStar size={16} color="#FFC71F" />
              {seller.rating}
            </span>
          </p>
        </div>

        <div className={styles.categoryWrapper}>
          <h2 className={styles.categoryLabel}>이 스토의 상품 보기</h2>
          <CategoryNav onSelectCategory={setSelectedCategory} />
        </div>

        {/* Reusable ProductGrid filtered by selectedCategory */}
        <ProductGrid
          products={seller.products.filter(
            (p) => p.category === selectedCategory
          )}
          onProductClick={(product) => router.push(`/products/${product.id}`)}
          /*  onAddToCart={(product) =>
            toast.success(`Added ${product.name} to cart`)
          } */
        />
      </div>
    </>
  );
}

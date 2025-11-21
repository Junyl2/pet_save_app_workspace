'use client';
import { ContactProduct } from '@/app/components/sections/ProductDetails/ContactProduct/ContactProduct';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
import { useSearchParams } from 'next/navigation';

export default function ContactProductPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const storeId = searchParams.get('storeId');

  if (!productId && !storeId) {
    return (
      <>
        <ProductHeader />
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>상품 또는 매장 정보를 찾을 수 없습니다.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ProductHeader />
      <ContactProduct productId={productId || undefined} storeId={storeId || undefined} />
    </>
  );
}

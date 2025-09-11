'use client';
import RegisterProductForm from '@/app/components/seller-components/RegisterProduct/RegisterProduct';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';

export default function RegisterProductPage() {
  return (
    <div>
      <ProductHeader />
      <RegisterProductForm />
    </div>
  );
}

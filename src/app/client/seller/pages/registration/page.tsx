import SellerInformation from '@/app/components/auth/seller-form/SellerForm';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
export default function SellerRegistrationPage() {
  return (
    <>
      <ProductHeader />
      <SellerInformation />
    </>
  );
}

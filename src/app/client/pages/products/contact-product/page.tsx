import { ContactProduct } from '@/app/components/sections/ProductDetails/ContactProduct/ContactProduct';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
export default function ContactProductPage() {
  return (
    <>
      <ProductHeader />
      <ContactProduct productId={1} />
    </>
  );
}

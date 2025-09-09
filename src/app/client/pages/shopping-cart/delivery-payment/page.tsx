import DeliveryPaymentPage from '@/app/components/pages/shopping-cart/DeliveryPaymentPage/DeliveryPaymentPage';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';
export default function DeliveryPaymentPageWrapper() {
  return (
    <div>
      <ProductHeader />
      <DeliveryPaymentPage />
    </div>
  );
}

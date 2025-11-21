import OrderHistory from '@/app/components/pages/my-page/order-history/OrderHistory';
import { ProductHeader } from '@/app/components/sections/ProductDetails/Header/ProductHeader';

export default function OrderHistoryPage() {
  return (
    <>
      <ProductHeader />
      <OrderHistory />
    </>
  );
}

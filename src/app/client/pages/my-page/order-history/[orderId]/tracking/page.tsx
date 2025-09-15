import OrderTracking from "@/app/components/pages/my-page/order-history/order-tracking/OrderTracking";
import { ProductHeader } from "@/app/components/sections/ProductDetails/Header/ProductHeader";

export default function OrderTrackingPage() {
  return (
    <>
      <ProductHeader />
      <OrderTracking />
    </>
  );
}

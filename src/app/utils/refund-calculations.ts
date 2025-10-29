import type { Product } from '@/app/components/types/order';

export function calculateRefundAmount(
  selectedProducts: Product[],
  isDeliveryOrder: boolean
) {
  const subtotal = selectedProducts.reduce(
    (sum, product) => sum + product.price,
    0
  );
  const deliveryFee = isDeliveryOrder ? 3000 : 0;
  const discount = 0;
  const returnFee = isDeliveryOrder ? 3000 : 0;
  const total = subtotal + deliveryFee - discount - returnFee;

  return {
    subtotal,
    deliveryFee,
    discount,
    returnFee,
    total,
  };
}

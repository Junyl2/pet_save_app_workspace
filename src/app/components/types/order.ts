export interface Product {
  id: number;
  orderItemId?: string;
  name: string;
  price: number;
  discountPrice?: number;
  brand?: string;
  image?: string;
  deliveryType: 'pickup' | 'delivery';
}

export type OrderItem = {
  product: Product;
  quantity: number;
};

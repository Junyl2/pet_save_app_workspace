export type Product = {
  id: number;
  name: string;
  price: number;
  discountPrice?: number | null;
  brand?: string;
  image?: string;
  deliveryType: 'pickup' | 'delivery';
};

export type OrderItem = {
  product: Product;
  quantity: number;
};

export interface Product {
  id: number;
  name: string;
  weight: string;
  quantity: string;
  price: number;
  discountPrice?: number;
  expiration: string;
  category: string;
  image: string;
  details?: string[];
  location: string;
  distance: string;
  shopName?: string;
  shopLocation?: string;
  shopDistance?: string;
  shopImage?: string;
  phoneNumber?: string;
}

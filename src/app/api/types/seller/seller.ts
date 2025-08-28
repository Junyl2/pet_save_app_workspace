import { Product } from '../products/products';

export interface Seller {
  id: number;
  name: string;
  phoneNumber: string;
  workingHours: string;
  location: string;
  products: Product[];
  reviewCount: number;
  rating: number;
}

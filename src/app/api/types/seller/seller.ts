import { Product } from '../products/products';

export interface Seller {
  id: number;
  ownerId?: number;
  name: string;
  phoneNumber: string;
  workingHours: string;
  location: string;
  rating: number;
  reviewCount: number;
  products: Product[];
}

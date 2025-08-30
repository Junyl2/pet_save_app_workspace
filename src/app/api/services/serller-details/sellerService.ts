import { mockProducts } from '@/app/components/pages/products/mockProducts';
import { Seller } from '../../types/seller/seller';

// Mock Seller Data
const mockSeller: Seller = {
  id: 1,
  name: 'ㅇㅇ 동물병원',
  phoneNumber: '000-0000-0000',
  workingHours: '매일 09:00 - 18:00',
  location: '서울 관악구 신림로70길 23',
  products: mockProducts,
  reviewCount: 145,
  rating: 4.2,
};

export const sellerService = {
  getSellerDetails: (): Promise<Seller> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSeller), 300);
    });
  },
};

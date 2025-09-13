import { Product } from '@/app/api/types/products/products';
import { mockProducts } from '@/app/components/pages/products/mockProducts';

export interface Inquiry {
  productId: number;
  inquiryType: string;
  content: string;
  fileName?: string | null;
}

export const productContactService = {
  getProductById: (id: number): Product | undefined => {
    return mockProducts.find((p) => p.id === id);
  },

  submitInquiry: async (inquiry: Inquiry) => {
    // Simulate API delay
    return new Promise<{ success: boolean }>((resolve) => {
      console.log('Inquiry submitted:', inquiry);
      setTimeout(() => resolve({ success: true }), 1000);
    });
  },
};

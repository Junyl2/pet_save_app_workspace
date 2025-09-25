import { mockReviews } from '@/app/components/pages/products/mockCustomerReview';
import { Review } from '../../types/review/review';

export const reviewService = {
  getByProductId: async (
    productId: string | number
  ): Promise<{ data: Review[]; error?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reviews = mockReviews.filter((r) => r.productId === productId);
        resolve({ data: reviews });
      }, 500);
    });
  },
  // future endpoints
  // createReview, updateReview, deleteReview...
};

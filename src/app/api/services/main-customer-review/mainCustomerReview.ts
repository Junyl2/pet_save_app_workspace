import { MainCustomerReview } from '../../types/review/MainReview';
import { mainCustomerReviewMock } from '@/app/components/data/mainCustomerReviewMock';
import { mockProducts } from '@/app/components/pages/products/mockProducts';

export const mainCustomerReviewService = {
  getAllReviews: (): MainCustomerReview[] => {
    return mainCustomerReviewMock.map((review) => {
      const product = mockProducts.find((p) => p.id === review.productId);
      return {
        ...review,
        productName: product?.name || '알 수 없는 상품',
      };
    });
  },

  getReviewsByProduct: (productId: number): MainCustomerReview[] => {
    const product = mockProducts.find((p) => p.id === productId);
    return mainCustomerReviewMock
      .filter((review) => review.productId === productId)
      .map((review) => ({
        ...review,
        productName: product?.name || '알 수 없는 상품',
      }));
  },

  getReviewById: (id: number): MainCustomerReview | undefined => {
    const review = mainCustomerReviewMock.find((review) => review.id === id);
    if (!review) return undefined;
    const product = mockProducts.find((p) => p.id === review.productId);
    return {
      ...review,
      productName: product?.name || '알 수 없는 상품',
    };
  },
};

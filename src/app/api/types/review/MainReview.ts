export interface MainCustomerReview {
  id: number;
  productId: number;
  author: string;
  avatar: string;
  rating: number;
  content: string;
  images?: string[];
  date: string;
  productName?: string;
  ratingComment?: string;
}

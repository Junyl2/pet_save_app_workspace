export interface ContactProduct {
  id: number;
  productId: number;
  productName: string;
  productWeight: string;
  quantity: string;
  price: string;
  inquiryType: string;
  content: string;
  images?: string[];
  date?: string;
}

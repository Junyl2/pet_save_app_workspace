export type ContactInquiry = {
  id: string;
  inquiryId?: string; // backend UUID for delete API
  date: string;
  shopName: string;
  shopLocation: string;
  shopImage: string;
  category: string;
  message: string;
  responseMessage: string;
  status: '답변 대기 중' | '답변 완료';
  answering?: boolean;
  productId?: string; // Added for routing to waiting reply page
};

export type CreateInquiryPayload = {
  category: string;
  message: string;
  images?: File[] | string[];
};

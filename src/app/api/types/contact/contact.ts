export type ContactInquiry = {
  id: number;
  date: string;
  shopName: string;
  shopLocation: string;
  shopImage: string;
  category: string;
  message: string;
  responseMessage: string;
  status: '답변 대기 중' | '답변 완료';
  answering?: boolean;
};

export type CreateInquiryPayload = {
  category: string;
  message: string;
  images?: File[] | string[];
};

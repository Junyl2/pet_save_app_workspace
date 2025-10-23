export interface AnswerInquiryRequest {
  answer: string;
}

export interface AnswerInquiryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: object;
  errorId?: string;
}

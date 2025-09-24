export interface BusinessRegistration {
  requestId: string;
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  applicantNickname: string;
  applicantPhoneNumber: string;
  businessRegistrationNumber: string;
  representativeName: string;
  businessName: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  fullAddress: string;
  businessEmail: string;
  bankName: string;
  accountNumber: string;
  depositorName: string;
  businessRegistrationCopy: string;
  bankbook: string;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export interface BusinessRegistrationResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: BusinessRegistration;
  errorId: string | null;
}

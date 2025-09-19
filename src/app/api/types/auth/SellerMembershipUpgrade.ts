export interface SellerMembershipUpgradeRequest {
  businessRegistrationNumber: string; // 사업자 등록번호
  representativeName: string; // 대표자 이름
  businessName: string; // 사업장 이름
  businessRegistrationCopyFileId: string; // 사업자 등록증 파일 ID
  roadAddress: string; // 도로명 주소
  detailedAddress: string; // 상세주소
  zipCode: string; // 우편번호
  bankName: string; // 은행 이름
  accountNumber: string; // 계좌번호
  depositorName: string; // 예금주 이름
  bankbookFileId: string; // 통장 사본 파일 ID
  businessEmail: string; // 사업자 이메일
}

export interface SellerMembershipUpgradeResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: any;
  errorId: string | null;
}

export interface SellerMembershipUpgradeErrorResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: any;
  errorId: string;
}

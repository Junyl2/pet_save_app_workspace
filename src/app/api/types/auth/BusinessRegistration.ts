/**
 * Business Registration API Types
 *
 * Types for the business registration application endpoint:
 * POST /api/pet-save/business-registrations
 */

/**
 * Request payload for business registration application
 */
export interface BusinessRegistrationRequest {
  /** Business registration number (사업자등록번호) */
  businessRegistrationNumber: string;
  /** Representative name (대표자명) */
  representativeName: string;
  /** Business name (사업자명) */
  businessName: string;
  /** Business registration copy file ID (사업자등록증 사본 파일 ID) */
  businessRegistrationCopyFileId: string;
  /** Road address (도로명주소) */
  roadAddress: string;
  /** Detailed address (상세주소) */
  detailedAddress: string;
  /** ZIP code (우편번호) */
  zipCode: string;
  /** Bank name (은행명) */
  bankName: string;
  /** Account number (계좌번호) */
  accountNumber: string;
  /** Depositor name (예금주명) */
  depositorName: string;
  /** Bankbook file ID (통장 사본 파일 ID) */
  bankbookFileId: string;
  /** Business email (사업자 이메일) */
  businessEmail: string;
  /** X coordinate (경도) */
  x: number;
  /** Y coordinate (위도) */
  y: number;
}

/**
 * Standard API response envelope
 */
export interface ApiResponseEnvelope {
  /** Success flag */
  success: boolean;
  /** Status code */
  status: number;
  /** Result message */
  resultMsg: string;
  /** Division code */
  divisionCode: string;
  /** Response data */
  data: Record<string, unknown>;
  /** Error ID */
  errorId: string;
}

/**
 * Response for business registration application
 */
export interface BusinessRegistrationResponse extends ApiResponseEnvelope {
  /** Response data (empty object for successful registration) */
  data: Record<string, unknown>;
}

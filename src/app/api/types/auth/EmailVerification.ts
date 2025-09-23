/**
 * Email verification request DTO
 * Endpoint: POST /api/pet-save/verification/email/send-verification
 */
export interface EmailVerificationRequest {
  /** User's name */
  name: string;

  /** User's email address */
  email: string;
}

/**
 * Email verification response
 */
export interface EmailVerificationResponse {
  /** Success status */
  success: boolean;

  /** Response message */
  message?: string;

  /** Verification code (if returned by API) */
  verificationCode?: string;
}

/**
 * Email verification code request
 * Endpoint: POST /api/pet-save/verification/verify-code
 */
export interface EmailVerifyCodeRequest {
  /** User's email address */
  email: string;

  /** Verification code */
  code: string;
}

/**
 * Phone verification code request
 * Endpoint: POST /api/pet-save/verification/verify-code
 */
export interface PhoneVerifyCodeRequest {
  /** User's phone number */
  phoneNumber: string;

  /** Verification code */
  code: string;
}

/**
 * Union type for verification code requests
 * Only one field should be included: email OR phoneNumber
 */
export type VerifyCodeRequest = EmailVerifyCodeRequest | PhoneVerifyCodeRequest;

/**
 * Verification code response
 */
export interface VerifyCodeResponse {
  /** Success status */
  success: boolean;

  /** Response message */
  message?: string;

  /** Response message (alternative field) */
  resultMsg?: string;

  /** Verification token (if returned by API) */
  verificationToken?: string;

  /** Verification ID (if returned by API) */
  verificationId?: string;
}

/**
 * Find ID by email payload response
 */
export interface FindIdByEmailPayload {
  /** Success status */
  success?: boolean;

  /** Response message */
  message?: string;

  /** Response message (alternative field) */
  resultMsg?: string;

  /** Additional data */
  data?: unknown;
}

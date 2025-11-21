/**
 * Phone verification request DTO
 * Endpoint: POST /api/pet-save/verification/phone/send-verification
 */
export interface PhoneVerificationRequest {
  /** User's name */
  name: string;

  /** User's phone number */
  phoneNumber: string;
}

/**
 * Phone verification response
 */
export interface PhoneVerificationResponse {
  /** Success status */
  success: boolean;

  /** Response message */
  message?: string;

  /** Verification code (if returned by API) */
  verificationCode?: string;
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
 * Verification code response
 */
export interface VerifyCodeResponse {
  /** Success status */
  success: boolean;

  /** Response message */
  message?: string;

  /** Verification token (if returned by API) */
  verificationToken?: string;
}

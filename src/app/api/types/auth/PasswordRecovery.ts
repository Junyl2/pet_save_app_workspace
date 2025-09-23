/**
 * Password recovery email verification request DTO
 * Endpoint: POST /api/pet-save/auth/recovery/password/email/send-verification
 */
export interface PasswordRecoveryEmailRequest {
  /** User's name */
  name: string;

  /** User's identifier (username) */
  identifier: string;

  /** User's email address */
  email: string;
}

/**
 * Password recovery phone verification request DTO
 * Endpoint: POST /api/pet-save/auth/recovery/password/phone/send-verification
 */
export interface PasswordRecoveryPhoneRequest {
  /** User's name */
  name: string;

  /** User's identifier (username) */
  identifier: string;

  /** User's phone number */
  phoneNumber: string;
}

/**
 * Password recovery verification response
 */
export interface PasswordRecoveryVerificationResponse {
  /** Success status */
  success: boolean;

  /** Response message */
  resultMsg?: string;

  /** Response message (alternative field) */
  message?: string;

  /** Division code */
  divisionCode?: string;

  /** Response data */
  data?: Record<string, unknown>;

  /** Error ID */
  errorId?: string;

  /** Verification ID (if returned by API) */
  verificationId?: string;
}

/**
 * Password recovery email request DTO
 * Endpoint: POST /api/pet-save/auth/recovery/password/email
 */
export interface PasswordRecoveryEmailFinalRequest {
  /** User's name */
  name: string;

  /** User's identifier (username) */
  identifier: string;

  /** User's email address */
  email: string;
}

/**
 * Password recovery phone request DTO
 * Endpoint: POST /api/pet-save/auth/recovery/password/phone
 */
export interface PasswordRecoveryPhoneFinalRequest {
  /** User's name */
  name: string;

  /** User's identifier (username) */
  identifier: string;

  /** User's phone number */
  phoneNumber: string;
}

/**
 * Password recovery final response
 */
export interface PasswordRecoveryFinalResponse {
  /** Success status */
  success: boolean;

  /** Response message */
  resultMsg?: string;

  /** Response message (alternative field) */
  message?: string;

  /** Division code */
  divisionCode?: string;

  /** Response data (contains reset token) */
  data?: {
    resetToken?: string;
  };

  /** Error ID */
  errorId?: string;
}

/**
 * Password recovery final request payload
 */
export interface PasswordRecoveryFinalPayload {
  /** Success status */
  success?: boolean;

  /** Response message */
  message?: string;

  /** Response message (alternative field) */
  resultMsg?: string;

  /** Additional data */
  data?: unknown;
}

/**
 * Password reset request DTO
 * Endpoint: POST /api/pet-save/auth/recovery/password/reset
 */
export interface PasswordResetRequest {
  /** New password */
  newPassword: string;

  /** Reset token */
  resetToken: string;
}

/**
 * Password reset response
 */
export interface PasswordResetResponse {
  /** Success status */
  success: boolean;

  /** Response message */
  resultMsg?: string;

  /** Division code */
  divisionCode?: string;

  /** Response data */
  data?: Record<string, unknown>;

  /** Error ID */
  errorId?: string;
}

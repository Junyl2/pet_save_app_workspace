/**
 * Login request DTO
 * Endpoint: POST /api/pet-save/auth/login
 */
export interface LoginRequest {
  /** Username, email, or phone number */
  identifier: string;

  /** Password - must match backend rules */
  password: string;

  /** Login type - GENERAL or other supported methods */
  loginType: string;
}

/**
 * Login response - success case
 * Actual API structure: { success: true, status: 201, resultMsg: "Insert Success", data: {...} }
 */
export interface LoginResponse {
  /** Success status */
  success: boolean;

  /** HTTP status code */
  status: number;

  /** Result message */
  resultMsg: string;

  /** Division code */
  divisionCode: string | null;

  /** User data and tokens */
  data: {
    /** Access token for API authentication */
    accessToken: string;

    /** Refresh token for token renewal */
    refreshToken: string;

    /** Login type */
    loginType: string;

    /** User UUID */
    uuidMember: string;

    /** User identifier (username) */
    identifier: string;

    /** User email */
    email?: string;

    /** User name */
    name?: string;

    /** User nickname */
    nickname?: string;

    /** User phone number */
    phoneNumber?: string;

    /** Additional user fields */
    [key: string]: any;
  };
}

/**
 * Login error response
 */
export interface LoginErrorResponse {
  /** Success status */
  success: false;

  /** Error message */
  message: string;

  /** Error code */
  code?: string;

  /** HTTP status code */
  status: number;
}

/**
 * Logout response - success case
 * Endpoint: POST /api/pet-save/auth/logout
 */
export interface LogoutResponse {
  /** Success status */
  success: boolean;

  /** HTTP status code */
  status: number;

  /** Result message */
  resultMsg: string;

  /** Division code */
  divisionCode: string;

  /** Empty data object */
  data: {};

  /** Error ID */
  errorId: string;
}

/**
 * Logout error response
 */
export interface LogoutErrorResponse {
  /** Success status */
  success: false;

  /** HTTP status code */
  status: number;

  /** Error message */
  resultMsg: string;

  /** Division code */
  divisionCode: string;

  /** Empty data object */
  data: {};

  /** Error ID */
  errorId: string;
}

/**
 * Identifier validation response - success case
 * Endpoint: GET /api/pet-save/auth/identifiers/validate
 */
export interface IdentifierValidationResponse {
  /** Success status */
  success: boolean;

  /** HTTP status code */
  status: number;

  /** Result message */
  resultMsg: string;

  /** Division code */
  divisionCode: string;

  /** Empty data object */
  data: {};

  /** Error ID */
  errorId: string | null;
}

/**
 * Identifier validation error response
 */
export interface IdentifierValidationErrorResponse {
  /** Success status */
  success: false;

  /** HTTP status code */
  status: number;

  /** Error message */
  resultMsg: string;

  /** Division code */
  divisionCode: string;

  /** Empty data object */
  data: {};

  /** Error ID */
  errorId: string;
}

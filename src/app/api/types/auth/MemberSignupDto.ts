/**
 * MemberSignupDto - TypeScript interface for general membership signup
 * Endpoint: POST /api/pet-save/auth/signup/general
 */
export interface MemberSignupDto {
  /** Required: User identifier (username/ID) */
  identifier: string;

  /** Required: User password */
  password: string;

  /** Required: Login type enum (e.g., "GENERAL") */
  loginType: string;

  /** Optional: Birth date in $date format */
  birthDate?: string;

  /** Optional: User's real name */
  name?: string;

  /** Optional: User's nickname */
  nickname?: string;

  /** Required: User's email address */
  email: string;

  /** Required: Phone number with regex validation ^[0-9+\-]+$ */
  phoneNumber: string;

  /** Required: Postal/ZIP code */
  zipCode: string;

  /** Required: Road address */
  roadAddress: string;

  /** Required: Detailed address */
  detailedAddress: string;

  /** Optional: Referral code */
  referralCode?: string;
}

/**
 * Login type enum values
 */
export const LOGIN_TYPES = {
  GENERAL: 'GENERAL',
  // Add other login types as needed
} as const;

export type LoginType = (typeof LOGIN_TYPES)[keyof typeof LOGIN_TYPES];

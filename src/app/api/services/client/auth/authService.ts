import { apiClient, ApiResponse } from '../../../apiClient';
import {
  MemberSignupDto,
  LOGIN_TYPES,
} from '../../../types/auth/MemberSignupDto';
import {
  EmailVerificationRequest,
  EmailVerificationResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  FindIdByEmailPayload,
} from '../../../types/auth/EmailVerification';
import {
  PhoneVerificationRequest,
  PhoneVerificationResponse,
} from '../../../types/auth/PhoneVerification';
import {
  PasswordRecoveryVerificationResponse,
  PasswordRecoveryFinalPayload,
  PasswordResetRequest,
  PasswordResetResponse,
} from '../../../types/auth/PasswordRecovery';
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  IdentifierValidationResponse,
} from '../../../types/auth/Login';

/** Narrow types used to avoid `any` while preserving behavior */
type UnknownJson = unknown;

type UserInfo = {
  id: string;
  identifier: string;
  email?: string;
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  loginType?: string;
};

type LoginApiData = {
  accessToken: string;
  // refreshToken?: string; // may be present from backend, but we don't store/use it here
  identifier: string;
  uuidMember?: string;
  email?: string;
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  loginType?: string;
};

export interface EmailValidationResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string | null;
  data?: unknown;
  errorId?: string | null;
}

type LoginApiEnvelope = { success?: boolean; data: LoginApiData };
type LoginAlt1 = { accessToken: string; refreshToken?: string; user: UserInfo };
type LoginAlt2 = { token: string; refreshToken?: string; user: UserInfo };

function isLoginApiEnvelope(x: unknown): x is LoginApiEnvelope {
  return (
    typeof x === 'object' &&
    x !== null &&
    'data' in x &&
    typeof (x as { data: unknown }).data === 'object' &&
    (x as { data: LoginApiData }).data !== null &&
    'accessToken' in (x as { data: LoginApiData }).data
  );
}
function isLoginAlt1(x: unknown): x is LoginAlt1 {
  return (
    typeof x === 'object' && x !== null && 'accessToken' in x && 'user' in x
  );
}
function isLoginAlt2(x: unknown): x is LoginAlt2 {
  return typeof x === 'object' && x !== null && 'token' in x && 'user' in x;
}

/**
 * Authentication service for user signup and login operations
 */
export class AuthService {
  /**
   * General membership signup
   * Endpoint: POST /api/pet-save/auth/signup/general
   */
  static async signupGeneral(
    signupData: MemberSignupDto
  ): Promise<ApiResponse<UnknownJson>> {
    try {
      // Normalize identifier to lowercase for case-insensitive handling
      const normalizedSignupData = {
        ...signupData,
        identifier: signupData.identifier.toLowerCase().trim(),
        loginType: signupData.loginType || LOGIN_TYPES.GENERAL,
      };

      console.log('Signup attempt:', {
        original: signupData.identifier,
        normalized: normalizedSignupData.identifier,
      });

      const response = await apiClient.post<UnknownJson>(
        '/auth/signup/general',
        normalizedSignupData
      );

      if (response.error) {
        console.error('Signup failed:', response.error);
        return response;
      }

      console.log('Signup successful:', response.data);
      return response;
    } catch (error) {
      console.error('Signup service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  /**
   * Check email availability
   * Endpoint: GET /api/pet-save/auth/emails/validate
   */
  static async validateEmailAvailability(
    email: string
  ): Promise<ApiResponse<EmailValidationResponse>> {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      console.log('Validating email availability:', normalizedEmail);

      const response = await apiClient.get<EmailValidationResponse>(
        `/auth/emails/validate?email=${encodeURIComponent(normalizedEmail)}`
      );

      if (response.error) {
        console.error('Email validation failed:', response.error);
        return response;
      }

      console.log('Email validation successful:', response.data);
      return response;
    } catch (error) {
      console.error('Email validation service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to validate email availability',
      };
    }
  }

  /**
   * Returns true if the email is available for use
   */
  static async isEmailAvailable(email: string): Promise<boolean> {
    try {
      const response = await this.validateEmailAvailability(email);
      return !response.error && response.data?.success === true;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return false;
    }
  }

  /**
   * Login user with identifier and password
   * Endpoint: POST /api/pet-save/auth/login
   */
  static async login(
    loginData: LoginRequest
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('Login request data:', JSON.stringify(loginData, null, 2));

      const response = await apiClient.post<UnknownJson>(
        '/auth/login',
        loginData
      );

      console.log('Login API response:', response);
      console.log('Response data type:', typeof response.data);

      if (response.error) {
        console.error('Login failed:', response.error);
        return {
          data: null,
          error: response.error,
        };
      }

      // Store auth tokens if login successful
      if (response.data && typeof window !== 'undefined') {
        let accessToken: string | undefined;
        let user: UserInfo | undefined;

        const responseData: unknown = response.data;

        if (isLoginApiEnvelope(responseData)) {
          // Structure: { success: true, data: { accessToken, identifier, ... } }
          const userData = responseData.data;
          console.log('User data from API:', userData);

          accessToken = userData.accessToken;
          user = {
            id: userData.uuidMember || userData.identifier,
            identifier: userData.identifier,
            email: userData.email || '',
            name: userData.name || userData.identifier,
            nickname: userData.nickname || userData.identifier,
            phoneNumber: userData.phoneNumber || '',
            loginType: userData.loginType || 'GENERAL',
          };
          console.log('Created user object:', user);
        } else if (isLoginAlt1(responseData)) {
          accessToken = responseData.accessToken;
          user = responseData.user;
        } else if (isLoginAlt2(responseData)) {
          accessToken = responseData.token;
          user = responseData.user;
        } else {
          console.error(
            'Login response has unexpected structure:',
            responseData
          );
          return {
            data: null,
            error: 'Login response has unexpected structure',
          };
        }

        if (accessToken && user && user.identifier) {
          localStorage.setItem('authToken', accessToken);
          localStorage.setItem('userInfo', JSON.stringify(user));
          console.log('Login successful, access token stored:', {
            user: user.identifier,
            note: 'Backend may also provide tokens in response headers',
          });
        } else {
          console.error('Login response missing required data:', {
            accessToken,
            user,
          });
          return {
            data: null,
            error:
              'Login response is missing required data (accessToken or user)',
          };
        }
      }

      // Cast back to the expected ApiResponse<LoginResponse> shape
      return {
        data: response.data as LoginResponse,
        error: response.error,
      };
    } catch (error) {
      console.error('Login service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Login user with identifier and password (convenience method)
   */
  static async loginWithCredentials(
    identifier: string,
    password: string,
    loginType: string = LOGIN_TYPES.GENERAL
  ): Promise<ApiResponse<LoginResponse>> {
    const normalizedIdentifier = identifier.toLowerCase().trim();

    console.log('Login attempt:', {
      original: identifier,
      normalized: normalizedIdentifier,
      loginType,
    });

    const loginData: LoginRequest = {
      identifier: normalizedIdentifier,
      password,
      loginType,
    };

    console.log('Sending login data:', loginData);

    return this.login(loginData);
  }

  /**
   * Logout user and clear stored tokens
   * Endpoint: POST /api/pet-save/auth/logout
   */
  static async logout(): Promise<ApiResponse<LogoutResponse>> {
    try {
      console.log('Attempting logout...');

      const response = await apiClient.post<LogoutResponse>('/auth/logout');

      console.log('Logout API response:', response);

      if (response.error) {
        console.error('Logout API failed:', response.error);
        this.clearLocalStorage();
        return response;
      }

      console.log('Logout successful:', response.data);
      this.clearLocalStorage();

      return response;
    } catch (error) {
      console.error('Logout service error:', error);
      this.clearLocalStorage();
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  /**
   * Clear all stored authentication and user-related data
   */
  private static clearLocalStorage(): void {
    if (typeof window !== 'undefined') {
      //  Remove auth & user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('sellerId');
      localStorage.removeItem('adminAuthToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUserInfo');

      // Remove cart & location data
      localStorage.removeItem('cart');
      localStorage.removeItem('checkoutItems');
      localStorage.removeItem('selectedLocation');
      localStorage.removeItem('selectedLocationLat');
      localStorage.removeItem('selectedLocationLong');

      // Remove all seller profile keys (seller:profile:*)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('seller:profile:')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      sessionStorage.clear();

      //  Remove Axios Authorization header
      try {
        delete apiClient.raw.defaults.headers.common['Authorization'];
      } catch {
        apiClient.raw.defaults.headers.common['Authorization'] = '';
      }

      console.log('🔒 Cleared auth, cart, and location data successfully');
    }
  }

  /**
   * Validate if an identifier (username/email/phone) is available
   * Endpoint: GET /api/pet-save/auth/identifiers/validate
   */
  static async validateIdentifier(
    identifier: string
  ): Promise<ApiResponse<IdentifierValidationResponse>> {
    try {
      const normalizedIdentifier = identifier.toLowerCase().trim();

      console.log('Validating identifier:', {
        original: identifier,
        normalized: normalizedIdentifier,
      });

      const response = await apiClient.get<IdentifierValidationResponse>(
        `/auth/identifiers/validate?identifier=${encodeURIComponent(
          normalizedIdentifier
        )}`
      );

      console.log('Identifier validation response:', response);
      console.log('Response error details:', response.error);
      console.log('Response data details:', response.data);

      if (response.error) {
        if (
          response.error.includes('409') ||
          response.error.includes('Conflict')
        ) {
          console.log(
            'Identifier validation: identifier is taken (409 Conflict)'
          );
        } else {
          console.error('Identifier validation failed:', response.error);
        }
        return response;
      }

      console.log('Identifier validation successful:', response.data);
      return response;
    } catch (error) {
      console.error('Identifier validation service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Identifier validation failed',
      };
    }
  }

  static async isIdentifierAvailable(identifier: string): Promise<boolean> {
    try {
      const response = await this.validateIdentifier(identifier);
      return !response.error && response.data?.success === true;
    } catch (error) {
      console.error('Error checking identifier availability:', error);
      return false;
    }
  }

  /** Validate business registration number */
  static async validateBusinessNumber(
    businessNumber: string
  ): Promise<ApiResponse<IdentifierValidationResponse>> {
    try {
      const normalizedBusinessNumber = businessNumber.trim();
      console.log('Validating business number:', normalizedBusinessNumber);

      const response = await apiClient.get<IdentifierValidationResponse>(
        `/auth/business-number/validate?businessNumber=${encodeURIComponent(
          normalizedBusinessNumber
        )}`
      );

      console.log('Business number validation response:', response);

      if (response.error) {
        if (
          response.error.includes('409') ||
          response.error.includes('Conflict')
        ) {
          console.log(
            'Business number validation: business number is taken (409 Conflict)'
          );
        } else {
          console.error('Business number validation failed:', response.error);
        }
        return response;
      }

      console.log('Business number validation successful:', response.data);
      return response;
    } catch (error) {
      console.error('Business number validation service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Business number validation failed',
      };
    }
  }

  static async isBusinessNumberAvailable(
    businessNumber: string
  ): Promise<boolean> {
    try {
      const response = await this.validateBusinessNumber(businessNumber);
      return !response.error && response.data?.success === true;
    } catch (error) {
      console.error('Error checking business number availability:', error);
      return false;
    }
  }

  /**
   * Get current user profile
   * Endpoint: GET /api/pet-save/auth/profile
   */
  static async getProfile(): Promise<ApiResponse<UnknownJson>> {
    try {
      const response = await apiClient.get<UnknownJson>('/auth/profile');

      if (response.error) {
        console.error('Get profile failed:', response.error);
        return response;
      }

      return response;
    } catch (error) {
      console.error('Get profile service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get profile',
      };
    }
  }

  /**
   * Send email verification code
   * Endpoint: POST /api/pet-save/verification/email/send-verification
   */
  static async sendEmailVerification(
    verificationData: EmailVerificationRequest
  ): Promise<ApiResponse<EmailVerificationResponse>> {
    try {
      const response = await apiClient.post<EmailVerificationResponse>(
        '/verification/email/send-verification',
        verificationData
      );

      if (response.error) {
        console.error('Email verification failed:', response.error);
        return response;
      }

      console.log('Email verification sent successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Email verification service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send email verification',
      };
    }
  }

  /**
   * Send phone verification code
   * Endpoint: POST /api/pet-save/verification/phone/send-verification
   */
  static async sendPhoneVerification(
    name: string,
    phoneNumber: string
  ): Promise<ApiResponse<PhoneVerificationResponse>> {
    try {
      console.log('Sending phone verification:', {
        name,
        phoneNumber,
      });

      const verificationData: PhoneVerificationRequest = {
        name,
        phoneNumber,
      };

      const response = await apiClient.post<PhoneVerificationResponse>(
        '/verification/phone/send-verification',
        verificationData
      );

      if (response.error) {
        console.error('Phone verification failed:', response.error);
        return response;
      }

      console.log('Phone verification sent successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Phone verification service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send phone verification',
      };
    }
  }

  /**
   * Verify email or phone verification code
   * Endpoint: POST /api/pet-save/verification/verify-code
   */
  static async verifyCode(
    verificationData: VerifyCodeRequest
  ): Promise<ApiResponse<VerifyCodeResponse>> {
    try {
      const response = await apiClient.post<VerifyCodeResponse>(
        '/verification/verify-code',
        verificationData
      );

      if (response.error) {
        console.error('Code verification failed:', response.error);
        return response;
      }

      console.log('Code verification successful:', response.data);
      return response;
    } catch (error) {
      console.error('Code verification service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to verify code',
      };
    }
  }

  static async verifyEmailCode(
    email: string,
    code: string
  ): Promise<ApiResponse<VerifyCodeResponse>> {
    return this.verifyCode({ email, code });
  }

  static async verifyPhoneCode(
    phoneNumber: string,
    code: string
  ): Promise<ApiResponse<VerifyCodeResponse>> {
    return this.verifyCode({ phoneNumber, code });
  }

  /**
   * Send find ID verification code via email
   * Endpoint: POST /api/pet-save/auth/recovery/id/email/send-verification
   */
  static async sendFindIdEmailVerification(
    name: string,
    email: string
  ): Promise<ApiResponse<UnknownJson>> {
    try {
      console.log('Sending find ID email verification:', {
        name,
        email,
      });

      const response = await apiClient.post<UnknownJson>(
        '/auth/recovery/id/email/send-verification',
        {
          name,
          email,
        }
      );

      if (response.error) {
        console.error('Find ID email verification failed:', response.error);
        return response;
      }

      console.log(
        'Find ID email verification sent successfully:',
        response.data
      );
      return response;
    } catch (error) {
      console.error('Find ID email verification service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send find ID email verification',
      };
    }
  }

  /**
   * Send find ID verification code via SMS
   * Endpoint: POST /api/pet-save/auth/recovery/id/phone/send-verification
   */
  static async sendFindIdSmsVerification(
    name: string,
    phoneNumber: string
  ): Promise<ApiResponse<UnknownJson>> {
    try {
      console.log('Sending find ID SMS verification:', {
        name,
        phoneNumber,
      });

      const response = await apiClient.post<UnknownJson>(
        '/auth/recovery/id/phone/send-verification',
        {
          name,
          phoneNumber,
        }
      );

      if (response.error) {
        console.error('Find ID SMS verification failed:', response.error);
        return response;
      }

      console.log('Find ID SMS verification sent successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Find ID SMS verification service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send find ID SMS verification',
      };
    }
  }

  /**
   * Retrieve identifier via email after verification
   * Endpoint: POST /api/pet-save/auth/recovery/id/email
   */
  static async findIdByEmail(
    name: string,
    email: string,
    verificationId?: string
  ): Promise<ApiResponse<FindIdByEmailPayload>> {
    try {
      console.log('Finding ID by email - Request:', {
        name,
        email,
        verificationId,
        endpoint: '/auth/recovery/id/email',
        timestamp: new Date().toISOString(),
      });

      const requestBody = verificationId
        ? { name, email, verificationId }
        : { name, email };

      const response = await apiClient.post<FindIdByEmailPayload>(
        '/auth/recovery/id/email',
        requestBody
      );

      if (response.error) {
        console.error('Find ID by email failed:', {
          error: response.error,
          name,
          email,
          verificationId,
          timestamp: new Date().toISOString(),
        });
        return response;
      }

      console.log('Find ID by email successful:', {
        responseData: response.data,
        name,
        email,
        verificationId,
        timestamp: new Date().toISOString(),
        note: 'Email should be sent to user with their ID information',
      });

      // Optional introspection without assuming structure
      const responseData: unknown = response.data;
      if (typeof responseData === 'object' && responseData !== null) {
        const maybe = responseData as Record<string, unknown>;
        console.log('Email sending details:', {
          success: maybe.success,
          message: (maybe.message ?? (maybe.resultMsg as unknown)) as unknown,
          data: maybe.data,
        });
      }

      return response;
    } catch (error) {
      console.error('Find ID by email service error:', {
        error: error instanceof Error ? error.message : error,
        name,
        email,
        verificationId,
        timestamp: new Date().toISOString(),
      });
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to find ID by email',
      };
    }
  }

  /**
   * Retrieve identifier via phone after verification
   * Endpoint: POST /api/pet-save/auth/recovery/id/phone
   */
  static async findIdByPhone(
    name: string,
    phoneNumber: string
  ): Promise<ApiResponse<UnknownJson>> {
    try {
      console.log('Finding ID by phone:', {
        name,
        phoneNumber,
      });

      const response = await apiClient.post<UnknownJson>(
        '/auth/recovery/id/phone',
        {
          name,
          phoneNumber,
        }
      );

      if (response.error) {
        console.error('Find ID by phone failed:', response.error);
        return response;
      }

      console.log('Find ID by phone successful:', response.data);
      return response;
    } catch (error) {
      console.error('Find ID by phone service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to find ID by phone',
      };
    }
  }

  // ==================== PASSWORD RECOVERY METHODS ====================

  /**
   * Send password recovery email verification code
   * Endpoint: POST /api/pet-save/auth/recovery/password/email/send-verification
   */
  static async sendPasswordRecoveryEmailVerification(
    name: string,
    identifier: string,
    email: string
  ): Promise<ApiResponse<PasswordRecoveryVerificationResponse>> {
    try {
      console.log('Sending password recovery email verification:', {
        name,
        identifier,
        email,
      });

      const verificationData = {
        name,
        identifier,
        email,
      };

      const response =
        await apiClient.post<PasswordRecoveryVerificationResponse>(
          '/auth/recovery/password/email/send-verification',
          verificationData
        );

      if (response.error) {
        console.error(
          'Password recovery email verification failed:',
          response.error
        );
        return response;
      }

      console.log(
        'Password recovery email verification sent successfully:',
        response.data
      );
      return response;
    } catch (error) {
      console.error(
        'Password recovery email verification service error:',
        error
      );
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send password recovery email verification',
      };
    }
  }

  /**
   * Send password recovery phone verification code
   * Endpoint: POST /api/pet-save/auth/recovery/password/phone/send-verification
   */
  static async sendPasswordRecoveryPhoneVerification(
    name: string,
    identifier: string,
    phoneNumber: string
  ): Promise<ApiResponse<PasswordRecoveryVerificationResponse>> {
    try {
      console.log('Sending password recovery phone verification:', {
        name,
        identifier,
        phoneNumber,
      });

      const verificationData = {
        name,
        identifier,
        phoneNumber,
      };

      const response =
        await apiClient.post<PasswordRecoveryVerificationResponse>(
          '/auth/recovery/password/phone/send-verification',
          verificationData
        );

      if (response.error) {
        console.error(
          'Password recovery phone verification failed:',
          response.error
        );
        return response;
      }

      console.log(
        'Password recovery phone verification sent successfully:',
        response.data
      );
      return response;
    } catch (error) {
      console.error(
        'Password recovery phone verification service error:',
        error
      );
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send password recovery phone verification',
      };
    }
  }

  /**
   * Get password recovery token via email
   * Endpoint: POST /api/pet-save/auth/recovery/password/email
   */
  static async getPasswordRecoveryTokenByEmail(
    name: string,
    identifier: string,
    email: string,
    verificationId?: string
  ): Promise<ApiResponse<PasswordRecoveryFinalPayload>> {
    try {
      console.log('Getting password recovery token by email:', {
        name,
        identifier,
        email,
        verificationId,
      });

      const requestData = verificationId
        ? { name, identifier, email, verificationId }
        : { name, identifier, email };

      const response = await apiClient.post<PasswordRecoveryFinalPayload>(
        '/auth/recovery/password/email',
        requestData
      );

      if (response.error) {
        console.error(
          'Password recovery token by email failed:',
          response.error
        );
        return response;
      }

      console.log(
        'Password recovery token by email successful:',
        response.data
      );
      return response;
    } catch (error) {
      console.error('Password recovery token by email service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get password recovery token by email',
      };
    }
  }

  /**
   * Get password recovery token via phone
   * Endpoint: POST /api/pet-save/auth/recovery/password/phone
   */
  static async getPasswordRecoveryTokenByPhone(
    name: string,
    identifier: string,
    phoneNumber: string
  ): Promise<ApiResponse<PasswordRecoveryVerificationResponse>> {
    try {
      console.log('Getting password recovery token by phone:', {
        name,
        identifier,
        phoneNumber,
      });

      const requestData = {
        name,
        identifier,
        phoneNumber,
      };

      const response =
        await apiClient.post<PasswordRecoveryVerificationResponse>(
          '/auth/recovery/password/phone',
          requestData
        );

      if (response.error) {
        console.error(
          'Password recovery token by phone failed:',
          response.error
        );
        return response;
      }

      console.log(
        'Password recovery token by phone successful:',
        response.data
      );
      return response;
    } catch (error) {
      console.error('Password recovery token by phone service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get password recovery token by phone',
      };
    }
  }

  /**
   * Reset password using reset token
   * Endpoint: POST /api/pet-save/auth/recovery/password/reset
   */
  static async resetPassword(
    newPassword: string,
    resetToken: string
  ): Promise<ApiResponse<PasswordResetResponse>> {
    try {
      console.log('Resetting password with token');

      const requestData: PasswordResetRequest = {
        newPassword,
        resetToken,
      };

      const response = await apiClient.post<PasswordResetResponse>(
        '/auth/recovery/password/reset',
        requestData
      );

      if (response.error) {
        console.error('Password reset failed:', response.error);
        return response;
      }

      console.log('Password reset successful:', response.data);
      return response;
    } catch (error) {
      console.error('Password reset service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to reset password',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   * Endpoint: POST /api/pet-save/auth/refresh
   */
  static async refreshToken(): Promise<ApiResponse<UnknownJson>> {
    try {
      if (typeof window === 'undefined') {
        return {
          data: null,
          error: 'Refresh token is only available in browser environment',
        };
      }

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('No refresh token available');
        return {
          data: null,
          error: 'No refresh token available',
        };
      }

      console.log('Refreshing access token...');

      const response = await apiClient.post<UnknownJson>('/auth/refresh', {
        refreshToken,
      });

      if (response.error) {
        console.error('Token refresh failed:', response.error);
        return response;
      }

      // Extract new access token from response
      const responseData: unknown = response.data;
      if (responseData && typeof responseData === 'object') {
        const data = responseData as Record<string, unknown>;
        const newAccessToken =
          (data.accessToken as string) ||
          (data.token as string) ||
          (data.data &&
          typeof data.data === 'object' &&
          (data.data as Record<string, unknown>).accessToken
            ? ((data.data as Record<string, unknown>).accessToken as string)
            : null);

        if (newAccessToken) {
          localStorage.setItem('authToken', newAccessToken);
          console.log('Token refresh successful, new token stored');
        } else {
          console.warn(
            'Token refresh response missing accessToken, checking localStorage'
          );
          // Check if token was set via response headers (handled by apiClient)
          const storedToken = localStorage.getItem('authToken');
          if (!storedToken) {
            console.error('New token not found in response or localStorage');
          }
        }
      }

      return response;
    } catch (error) {
      console.error('Token refresh service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to refresh token',
      };
    }
  }
}

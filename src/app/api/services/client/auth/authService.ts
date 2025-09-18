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
} from '../../../types/auth/EmailVerification';

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
  ): Promise<ApiResponse<any>> {
    try {
      // Ensure loginType is set to GENERAL if not provided
      const data = {
        ...signupData,
        loginType: signupData.loginType || LOGIN_TYPES.GENERAL,
      };

      const response = await apiClient.post('/auth/signup/general', data);

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
   * Login user with identifier and password
   * Endpoint: POST /api/pet-save/auth/login
   */
  static async login(
    identifier: string,
    password: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password,
      });

      if (response.error) {
        console.error('Login failed:', response.error);
        return response;
      }

      // Store auth token if login successful
      if (
        response.data &&
        typeof response.data === 'object' &&
        'token' in response.data &&
        typeof window !== 'undefined'
      ) {
        localStorage.setItem('authToken', (response.data as any).token);
      }

      return response;
    } catch (error) {
      console.error('Login service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Logout user and clear stored tokens
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout service error:', error);
    } finally {
      // Always clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        sessionStorage.clear();
      }
    }
  }

  /**
   * Get current user profile
   * Endpoint: GET /api/pet-save/auth/profile
   */
  static async getProfile(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/auth/profile');

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
   * Verify email or phone verification code
   * Endpoint: POST /api/pet-save/verification/verify-code
   * @param verificationData - Either email or phone verification data
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

  /**
   * Verify email verification code (convenience method)
   * @param email - User's email address
   * @param code - Verification code
   */
  static async verifyEmailCode(
    email: string,
    code: string
  ): Promise<ApiResponse<VerifyCodeResponse>> {
    return this.verifyCode({ email, code });
  }

  /**
   * Verify phone verification code (convenience method)
   * @param phoneNumber - User's phone number
   * @param code - Verification code
   */
  static async verifyPhoneCode(
    phoneNumber: string,
    code: string
  ): Promise<ApiResponse<VerifyCodeResponse>> {
    return this.verifyCode({ phoneNumber, code });
  }
}

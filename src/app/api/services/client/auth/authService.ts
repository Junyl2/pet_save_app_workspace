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
import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  IdentifierValidationResponse,
} from '../../../types/auth/Login';
import {
  SellerMembershipUpgradeRequest,
  SellerMembershipUpgradeResponse,
} from '../../../types/auth/SellerMembershipUpgrade';

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

      const response = await apiClient.post(
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
   * Login user with identifier and password
   * Endpoint: POST /api/pet-save/auth/login
   */
  static async login(
    loginData: LoginRequest
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      // Log the exact request being sent
      console.log('Login request data:', JSON.stringify(loginData, null, 2));

      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        loginData
      );

      // Debug: Log the full response structure
      console.log('Login API response:', response);
      console.log('Response data type:', typeof response.data);
      console.log(
        'Response data keys:',
        response.data ? Object.keys(response.data) : 'null'
      );

      if (response.error) {
        console.error('Login failed:', response.error);
        return response;
      }

      // Store auth tokens if login successful
      if (response.data && typeof window !== 'undefined') {
        // Handle different possible response structures
        let accessToken, refreshToken, user;
        const responseData = response.data as any; // Type assertion for flexible response handling

        if (responseData.data && responseData.data.accessToken) {
          // Actual API structure: { success: true, data: { accessToken, refreshToken, identifier, ... } }
          const userData = responseData.data;
          console.log('User data from API:', userData);

          accessToken = userData.accessToken;
          refreshToken = userData.refreshToken;
          // Create user object from the available data
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
        } else if (responseData.accessToken && responseData.user) {
          // Expected structure
          ({ accessToken, refreshToken, user } = responseData);
        } else if (responseData.token && responseData.user) {
          // Alternative structure with 'token' instead of 'accessToken'
          accessToken = responseData.token;
          refreshToken = responseData.refreshToken;
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

        // Validate that we have the required data
        if (accessToken && user && user.identifier) {
          // Store tokens in localStorage
          localStorage.setItem('authToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          localStorage.setItem('userInfo', JSON.stringify(user));

          console.log('Login successful, tokens stored:', {
            user: user.identifier,
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
   * Login user with identifier and password (convenience method)
   * @param identifier - Username, email, or phone number
   * @param password - User password
   * @param loginType - Login type (default: GENERAL)
   */
  static async loginWithCredentials(
    identifier: string,
    password: string,
    loginType: string = LOGIN_TYPES.GENERAL
  ): Promise<ApiResponse<LoginResponse>> {
    // Normalize identifier to lowercase for case-insensitive login
    const normalizedIdentifier = identifier.toLowerCase().trim();

    console.log('Login attempt:', {
      original: identifier,
      normalized: normalizedIdentifier,
      loginType,
    });

    // Try different request formats
    const loginData = {
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

      // Call logout endpoint
      const response = await apiClient.post<LogoutResponse>('/auth/logout');

      console.log('Logout API response:', response);

      if (response.error) {
        console.error('Logout API failed:', response.error);
        // Still clear local storage even if API call fails
        this.clearLocalStorage();
        return response;
      }

      console.log('Logout successful:', response.data);

      // Clear local storage on successful logout
      this.clearLocalStorage();

      return response;
    } catch (error) {
      console.error('Logout service error:', error);
      // Always clear local storage even if there's an error
      this.clearLocalStorage();
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  /**
   * Clear all stored authentication data
   */
  private static clearLocalStorage(): void {
    if (typeof window !== 'undefined') {
      // Clear all authentication-related localStorage items
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('user'); // UserContext data
      localStorage.removeItem('userName'); // AuthContext data
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('sellerId');

      // Clear all session storage
      sessionStorage.clear();

      console.log('All authentication data cleared from storage');
    }
  }

  /**
   * Validate if an identifier (username/email/phone) is available
   * Endpoint: GET /api/pet-save/auth/identifiers/validate
   * @param identifier - Username, email, or phone number to validate
   */
  static async validateIdentifier(
    identifier: string
  ): Promise<ApiResponse<IdentifierValidationResponse>> {
    try {
      // Normalize identifier to lowercase for case-insensitive validation
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

      // Debug: Log the response structure
      console.log('Identifier validation response:', response);
      console.log('Response error details:', response.error);
      console.log('Response data details:', response.data);

      if (response.error) {
        // 409 Conflict means identifier is taken (this is a valid response, not a failure)
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

  /**
   * Check if an identifier is available (convenience method)
   * @param identifier - Username, email, or phone number to check
   * @returns Promise<boolean> - true if available, false if taken or error
   */
  static async isIdentifierAvailable(identifier: string): Promise<boolean> {
    try {
      const response = await this.validateIdentifier(identifier);
      return !response.error && response.data?.success === true;
    } catch (error) {
      console.error('Error checking identifier availability:', error);
      return false;
    }
  }

  /**
   * Validate business registration number (similar to identifier validation)
   * @param businessNumber - Business registration number to validate
   */
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
        // 409 Conflict means business number is taken (this is a valid response, not a failure)
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

  /**
   * Check if a business number is available (convenience method)
   * @param businessNumber - Business registration number to check
   * @returns Promise<boolean> - true if available, false if taken or error
   */
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
   * Upgrade user to seller membership
   * @param upgradeData - Seller membership upgrade data
   */
  static async upgradeToSellerMembership(
    upgradeData: SellerMembershipUpgradeRequest
  ): Promise<ApiResponse<SellerMembershipUpgradeResponse>> {
    try {
      console.log('Upgrading to seller membership:', upgradeData);

      const response = await apiClient.post<SellerMembershipUpgradeResponse>(
        '/auth/membership/join/seller',
        upgradeData
      );

      console.log('Seller membership upgrade response:', response);

      if (response.error) {
        console.error('Seller membership upgrade failed:', response.error);
        return response;
      }

      console.log('Seller membership upgrade successful:', response.data);
      return response;
    } catch (error) {
      console.error('Seller membership upgrade service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Seller membership upgrade failed',
      };
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

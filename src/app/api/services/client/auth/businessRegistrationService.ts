import { apiClient, ApiResponse } from '../../../apiClient';
import {
  BusinessRegistrationRequest,
  BusinessRegistrationResponse,
} from '../../../types/auth/BusinessRegistration';

/**
 * Business Registration Service
 *
 * Service for handling business registration applications.
 * Replaces the old seller membership upgrade functionality.
 */
export class BusinessRegistrationService {
  /**
   * Submit business registration application
   * Endpoint: POST /api/pet-save/business-registrations
   *
   * @param registrationData - Business registration application data
   * @returns Promise<ApiResponse<BusinessRegistrationResponse>>
   */
  static async submitBusinessRegistration(
    registrationData: BusinessRegistrationRequest
  ): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      console.log('Submitting business registration application:', {
        businessName: registrationData.businessName,
        representativeName: registrationData.representativeName,
        businessRegistrationNumber: registrationData.businessRegistrationNumber,
        businessEmail: registrationData.businessEmail,
      });

      const response = await apiClient.post<BusinessRegistrationResponse>(
        '/business-registrations',
        registrationData
      );

      console.log('Business registration API response:', response);

      if (response.error) {
        console.error(
          'Business registration submission failed:',
          response.error
        );

        // Handle specific error cases for re-registration
        if (
          response.error.includes('409') ||
          response.error.includes('already exists') ||
          response.error.includes('duplicate') ||
          response.error.includes('이미 등록')
        ) {
          console.log(
            '🔄 User already has business registration, attempting update...'
          );
          return await this.updateBusinessRegistration(registrationData);
        }

        return response;
      }

      console.log(
        'Business registration submitted successfully:',
        response.data
      );
      return response;
    } catch (error) {
      console.error('Business registration service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Business registration submission failed',
      };
    }
  }

  /**
   * Update existing business registration (for rejected users re-applying)
   * Endpoint: PUT /api/pet-save/business-registrations
   *
   * @param registrationData - Updated business registration data
   * @returns Promise<ApiResponse<BusinessRegistrationResponse>>
   */
  static async updateBusinessRegistration(
    registrationData: BusinessRegistrationRequest
  ): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      console.log('Updating existing business registration:', {
        businessName: registrationData.businessName,
        representativeName: registrationData.representativeName,
        businessRegistrationNumber: registrationData.businessRegistrationNumber,
        businessEmail: registrationData.businessEmail,
      });

      const response = await apiClient.put<BusinessRegistrationResponse>(
        '/business-registrations',
        registrationData
      );

      console.log('Business registration update response:', response);

      if (response.error) {
        console.error('Business registration update failed:', response.error);
        return response;
      }

      console.log('Business registration updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Business registration update service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Business registration update failed',
      };
    }
  }

  /**
   * Check if user has existing business registration
   * Endpoint: GET /api/pet-save/business-registrations/me
   *
   * @returns Promise<ApiResponse<BusinessRegistrationResponse>>
   */
  static async getExistingBusinessRegistration(): Promise<
    ApiResponse<BusinessRegistrationResponse>
  > {
    try {
      console.log('Checking for existing business registration...');

      const response = await apiClient.get<BusinessRegistrationResponse>(
        '/business-registrations/me'
      );

      console.log('Existing business registration response:', response);

      if (response.error) {
        console.log('No existing business registration found:', response.error);
        return response;
      }

      console.log('Existing business registration found:', response.data);
      return response;
    } catch (error) {
      console.error('Error checking existing business registration:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check existing business registration',
      };
    }
  }

  /**
   * Validate business registration data before submission
   *
   * @param registrationData - Business registration data to validate
   * @returns Object with validation results
   */
  static validateBusinessRegistrationData(
    registrationData: Partial<BusinessRegistrationRequest>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validations
    if (!registrationData.businessRegistrationNumber?.trim()) {
      errors.push('Business registration number is required');
    }

    if (!registrationData.representativeName?.trim()) {
      errors.push('Representative name is required');
    }

    if (!registrationData.businessName?.trim()) {
      errors.push('Business name is required');
    }

    if (!registrationData.businessRegistrationCopyFileId?.trim()) {
      errors.push('Business registration copy file is required');
    }

    if (!registrationData.roadAddress?.trim()) {
      errors.push('Road address is required');
    }

    if (!registrationData.detailedAddress?.trim()) {
      errors.push('Detailed address is required');
    }

    if (!registrationData.zipCode?.trim()) {
      errors.push('ZIP code is required');
    }

    if (!registrationData.bankName?.trim()) {
      errors.push('Bank name is required');
    }

    if (!registrationData.accountNumber?.trim()) {
      errors.push('Account number is required');
    }

    if (!registrationData.depositorName?.trim()) {
      errors.push('Depositor name is required');
    }

    if (!registrationData.bankbookFileId?.trim()) {
      errors.push('Bankbook file is required');
    }

    if (!registrationData.businessEmail?.trim()) {
      errors.push('Business email is required');
    }

    // Email format validation
    if (
      registrationData.businessEmail &&
      !this.isValidEmail(registrationData.businessEmail)
    ) {
      errors.push('Business email format is invalid');
    }

    // Business registration number format validation (Korean format: XXX-XX-XXXXX)
    if (
      registrationData.businessRegistrationNumber &&
      !this.isValidBusinessRegistrationNumber(
        registrationData.businessRegistrationNumber
      )
    ) {
      errors.push(
        'Business registration number must be 10 digits (e.g., 123-45-67890)'
      );
    }

    // Coordinate validation
    if (
      registrationData.x !== undefined &&
      (isNaN(registrationData.x) ||
        registrationData.x < -180 ||
        registrationData.x > 180)
    ) {
      errors.push('X coordinate must be a valid longitude (-180 to 180)');
    }

    if (
      registrationData.y !== undefined &&
      (isNaN(registrationData.y) ||
        registrationData.y < -90 ||
        registrationData.y > 90)
    ) {
      errors.push('Y coordinate must be a valid latitude (-90 to 90)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate and normalize Korean business registration number format
   * Accepts any format and normalizes to XXX-XX-XXXXX
   */
  private static isValidBusinessRegistrationNumber(
    businessNumber: string
  ): boolean {
    if (!businessNumber || typeof businessNumber !== 'string') {
      return false;
    }

    // Remove all non-digit characters
    const digits = businessNumber.replace(/\D/g, '');

    // Must have exactly 10 digits
    return digits.length === 10;
  }

  /**
   * Normalize business registration number to standard format (XXX-XX-XXXXX)
   */
  static normalizeBusinessRegistrationNumber(businessNumber: string): string {
    if (!businessNumber || typeof businessNumber !== 'string') {
      return '';
    }

    // Remove all non-digit characters
    const digits = businessNumber.replace(/\D/g, '');

    // If we have 10 digits, format as XXX-XX-XXXXX
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }

    // Return original if not 10 digits (will be caught by validation)
    return businessNumber;
  }
}

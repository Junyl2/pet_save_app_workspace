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
        'Business registration number format is invalid (expected: XXX-XX-XXXXX)'
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
   * Validate Korean business registration number format (XXX-XX-XXXXX)
   */
  private static isValidBusinessRegistrationNumber(
    businessNumber: string
  ): boolean {
    const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
    return businessNumberRegex.test(businessNumber);
  }
}

import { apiClient, ApiResponse } from '../../../apiClient';
import {
  BusinessRegistrationRequest,
  BusinessRegistrationResponse,
  BusinessRegistrationListQuery,
  BusinessRegistrationListResponse,
} from '../../../types/auth/BusinessRegistration';

/**
 * Business Registration Service
 *
 * Handles user and admin endpoints related to business registrations.
 */
export class BusinessRegistrationService {
  /**
   * Submit new business registration application
   * Endpoint: POST /api/pet-save/business-registrations
   */
  static async submitBusinessRegistration(
    registrationData: BusinessRegistrationRequest
  ): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      console.log('Submitting business registration:', {
        businessName: registrationData.businessName,
        representativeName: registrationData.representativeName,
        businessRegistrationNumber: registrationData.businessRegistrationNumber,
      });

      const response = await apiClient.post<BusinessRegistrationResponse>(
        '/business-registrations',
        registrationData
      );

      if (response.error) {
        console.error('Business registration failed:', response.error);

        // Attempt update if registration already exists
        if (
          response.error.includes('409') ||
          response.error.includes('duplicate') ||
          response.error.includes('already exists') ||
          response.error.includes('이미 등록')
        ) {
          console.log('Attempting to update existing registration...');
          return await this.updateBusinessRegistration(registrationData);
        }
      }

      return response;
    } catch (error) {
      console.error('Submit business registration error:', error);
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
   * Update an existing business registration (for re-application)
   * Endpoint: PUT /api/pet-save/business-registrations
   */
  static async updateBusinessRegistration(
    registrationData: BusinessRegistrationRequest
  ): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      console.log('Updating existing business registration...');

      const response = await apiClient.put<BusinessRegistrationResponse>(
        '/business-registrations',
        registrationData
      );

      if (response.error) {
        console.error('Update business registration failed:', response.error);
      }

      return response;
    } catch (error) {
      console.error('Update business registration error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update business registration',
      };
    }
  }

  /**
   * Get current user's business registration (if any)
   * Endpoint: GET /api/pet-save/business-registrations/me
   */
  static async getExistingBusinessRegistration(): Promise<
    ApiResponse<BusinessRegistrationResponse>
  > {
    try {
      console.log('Fetching existing business registration...');
      const response = await apiClient.get<BusinessRegistrationResponse>(
        '/business-registrations/me'
      );

      if (response.error) {
        console.warn('No business registration found:', response.error);
      }

      return response;
    } catch (error) {
      console.error('Get existing business registration error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch existing business registration',
      };
    }
  }

  /**
   * Get all business registration applications (ADMIN)
   * Endpoint: GET /api/pet-save/business-registrations
   */
  static async getAllBusinessRegistrations(
    params?: BusinessRegistrationListQuery
  ): Promise<ApiResponse<BusinessRegistrationListResponse>> {
    try {
      const query = new URLSearchParams();

      if (params?.keyword) query.append('keyword', params.keyword);
      if (params?.status) query.append('status', params.status);
      if (params?.dateStart) query.append('dateStart', params.dateStart);
      if (params?.dateEnd) query.append('dateEnd', params.dateEnd);
      if (params?.page !== undefined)
        query.append('page', params.page.toString());
      if (params?.size !== undefined)
        query.append('size', params.size.toString());
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.direction) query.append('direction', params.direction);

      const url = `/business-registrations${
        query.toString() ? `?${query}` : ''
      }`;

      const response = await apiClient.get<BusinessRegistrationListResponse>(
        url
      );

      if (response.error) {
        console.error(
          'Failed to fetch business registrations:',
          response.error
        );
        return response;
      }

      console.log(
        `Fetched ${
          response.data?.data?.content?.length ?? 0
        } registrations (page ${
          response.data?.data?.pageInfo?.currentPage ?? 0
        })`
      );

      return response;
    } catch (error) {
      console.error('Admin business registrations fetch error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch business registrations',
      };
    }
  }

  /**
   * Validate business registration form before submission
   */
  static validateBusinessRegistrationData(
    registrationData: Partial<BusinessRegistrationRequest>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!registrationData.businessRegistrationNumber?.trim())
      errors.push('Business registration number is required');
    if (!registrationData.representativeName?.trim())
      errors.push('Representative name is required');
    if (!registrationData.businessName?.trim())
      errors.push('Business name is required');
    if (!registrationData.businessRegistrationCopyFileId?.trim())
      errors.push('Business registration copy file is required');
    if (!registrationData.roadAddress?.trim())
      errors.push('Road address is required');
    if (!registrationData.detailedAddress?.trim())
      errors.push('Detailed address is required');
    if (!registrationData.zipCode?.trim()) errors.push('ZIP code is required');
    if (!registrationData.bankName?.trim())
      errors.push('Bank name is required');
    if (!registrationData.accountNumber?.trim())
      errors.push('Account number is required');
    if (!registrationData.depositorName?.trim())
      errors.push('Depositor name is required');
    if (!registrationData.bankbookFileId?.trim())
      errors.push('Bankbook file is required');
    if (!registrationData.businessEmail?.trim())
      errors.push('Business email is required');

    if (
      registrationData.businessEmail &&
      !this.isValidEmail(registrationData.businessEmail)
    )
      errors.push('Invalid business email format');

    if (
      registrationData.businessRegistrationNumber &&
      !this.isValidBusinessRegistrationNumber(
        registrationData.businessRegistrationNumber
      )
    )
      errors.push('Business registration number must have 10 digits');

    return { isValid: errors.length === 0, errors };
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private static isValidBusinessRegistrationNumber(num: string): boolean {
    const digits = num.replace(/\D/g, '');
    return digits.length === 10;
  }

  static normalizeBusinessRegistrationNumber(num: string): string {
    const digits = num.replace(/\D/g, '');
    return digits.length === 10
      ? `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
      : num;
  }
}

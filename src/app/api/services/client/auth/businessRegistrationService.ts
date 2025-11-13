import { apiClient, ApiResponse } from '../../../apiClient';
import {
  BusinessRegistrationRequest,
  BusinessRegistrationResponse,
  BusinessRegistrationActionRequest,
} from '../../../types/auth/BusinessRegistration';

/**
 * Business Registration Service
 *
 * Handles all operations related to business registration
 * (member submission + admin approval management)
 */
export class BusinessRegistrationService {
  /**
   * Submit a business registration application
   * POST /api/pet-save/business-registrations
   */
  static async submitBusinessRegistration(
    registrationData: BusinessRegistrationRequest
  ): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      const response = await apiClient.post<BusinessRegistrationResponse>(
        '/business-registrations',
        registrationData
      );

      if (response.error) {
        console.error(
          'Business registration submission failed:',
          response.error
        );

        // Attempt update if duplicate registration exists
        if (
          response.error.includes('409') ||
          response.error.includes('already exists') ||
          response.error.includes('duplicate') ||
          response.error.includes('이미 등록')
        ) {
          console.log(' Existing registration found — attempting update...');
          return await this.updateBusinessRegistration(registrationData);
        }

        return response;
      }

      console.log(' Business registration submitted:', response.data);
      return response;
    } catch (error) {
      console.error(' Business registration service error:', error);
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
   * Update existing business registration
   * PUT /api/pet-save/business-registrations
   */
  static async updateBusinessRegistration(
    registrationData: BusinessRegistrationRequest
  ): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      const response = await apiClient.put<BusinessRegistrationResponse>(
        '/business-registrations',
        registrationData
      );

      if (response.error) {
        console.error('Business registration update failed:', response.error);
        return response;
      }

      console.log(' Business registration updated:', response.data);
      return response;
    } catch (error) {
      console.error(' Business registration update service error:', error);
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
   * Get current member’s own registration info
   * GET /api/pet-save/business-registrations/me
   */
  static async getExistingBusinessRegistration(): Promise<
    ApiResponse<BusinessRegistrationResponse>
  > {
    try {
      const response = await apiClient.get<BusinessRegistrationResponse>(
        '/business-registrations/me'
      );
      return response;
    } catch (error) {
      console.error('❌ Error fetching existing business registration:', error);
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
   * Get all business registrations (Admin)
   * GET /api/pet-save/business-registrations
   */
  static async getAllBusinessRegistrations(params?: {
    keyword?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    dateStart?: string;
    dateEnd?: string;
    page?: number;
    size?: number;
    sortBy?: 'createdAt';
    direction?: 'asc' | 'desc';
  }): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      const query = new URLSearchParams();
      if (params?.keyword) query.append('keyword', params.keyword);
      if (params?.status) query.append('status', params.status);
      if (params?.dateStart) query.append('dateStart', params.dateStart);
      if (params?.dateEnd) query.append('dateEnd', params.dateEnd);
      if (params?.page !== undefined) query.append('page', String(params.page));
      if (params?.size !== undefined) query.append('size', String(params.size));
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.direction) query.append('direction', params.direction);

      const url =
        query.toString().length > 0
          ? `/business-registrations?${query.toString()}`
          : '/business-registrations';

      const response = await apiClient.get<BusinessRegistrationResponse>(url);
      return response;
    } catch (error) {
      console.error(' Error fetching all business registrations:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch all business registrations',
      };
    }
  }

  /**
   * Get business registration by specific member (Admin)
   * GET /api/pet-save/business-registrations/member/{memberId}
   */
  static async getBusinessRegistrationByMemberId(
    memberId: string
  ): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      if (!memberId) {
        throw new Error('memberId is required');
      }

      const response = await apiClient.get<BusinessRegistrationResponse>(
        `/business-registrations/member/${memberId}`
      );

      console.log(
        ' Business registration fetched by member ID:',
        response.data
      );
      return response;
    } catch (error) {
      console.error(
        ' Error fetching business registration by member ID:',
        error
      );
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch business registration by member ID',
      };
    }
  }

  /**
   * Approve a business registration (Admin)
   * POST /api/pet-save/business-registrations/{requestId}/approve
   */
  static async approveBusinessRegistration(
    requestId: string,
    payload?: BusinessRegistrationActionRequest
  ): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      const response = await apiClient.post<BusinessRegistrationResponse>(
        `/business-registrations/${requestId}/approve`,
        payload ?? {}
      );

      console.log(' Business registration approved:', response);
      return response;
    } catch (error) {
      console.error(' Error approving business registration:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Business registration approval failed',
      };
    }
  }

  /**
   * Reject a business registration (Admin)
   * POST /api/pet-save/business-registrations/{requestId}/reject
   */
  static async rejectBusinessRegistration(
    requestId: string,
    payload: BusinessRegistrationActionRequest
  ): Promise<ApiResponse<BusinessRegistrationResponse>> {
    try {
      const response = await apiClient.post<BusinessRegistrationResponse>(
        `/business-registrations/${requestId}/reject`,
        payload
      );

      console.log(' Business registration rejected:', response);
      return response;
    } catch (error) {
      console.error(' Error rejecting business registration:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Business registration rejection failed',
      };
    }
  }

  /** -------------------- Validation Helpers -------------------- **/
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
    ) {
      errors.push('Invalid email format');
    }

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

    return { isValid: errors.length === 0, errors };
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private static isValidBusinessRegistrationNumber(
    businessNumber: string
  ): boolean {
    const digits = businessNumber.replace(/\D/g, '');
    return digits.length === 10;
  }

  static normalizeBusinessRegistrationNumber(businessNumber: string): string {
    const digits = businessNumber.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    return businessNumber;
  }
}

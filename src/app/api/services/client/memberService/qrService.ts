import { apiClient, ApiResponse } from '../../../apiClient';
import { QRReferralResponse, QRErrorResponse } from '@/app/api/types/member/qr';

/**
 * QR Service for handling QR code related operations
 */
export class QRService {
  /**
   * Generate referral QR code for current user
   * Endpoint: GET /api/pet-save/qr/referral
   * Returns JPEG image of QR code containing referral code
   */
  static async getReferralQRCode(): Promise<ApiResponse<string>> {
    try {
      console.log('Generating referral QR code...');

      const response = await apiClient.getFile('/qr/referral', {
        headers: {
          Accept: 'image/jpeg',
        },
      });

      if (response.error) {
        console.error('Get referral QR code failed:', response.error);
        return {
          data: null,
          error: response.error,
        };
      }

      // Convert blob to data URL for display
      const blob = response.data as Blob;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      console.log('Referral QR code generated successfully');
      return {
        data: dataUrl,
        error: undefined,
      };
    } catch (error) {
      console.error('Error generating referral QR code:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to generate QR code',
      };
    }
  }

  /**
   * Download referral QR code as JPEG file
   * @param filename - Optional filename for the download
   */
  static async downloadReferralQRCode(
    filename: string = 'referral-qr-code.jpg'
  ): Promise<ApiResponse<void>> {
    try {
      console.log('Downloading referral QR code...');

      const response = await apiClient.getFile('/qr/referral', {
        headers: {
          Accept: 'image/jpeg',
        },
      });

      if (response.error) {
        console.error('Download referral QR code failed:', response.error);
        return {
          data: null,
          error: response.error,
        };
      }

      // Create download link
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Referral QR code downloaded successfully');
      return {
        data: undefined,
        error: undefined,
      };
    } catch (error) {
      console.error('Error downloading referral QR code:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to download QR code',
      };
    }
  }
}

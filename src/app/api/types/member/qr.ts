/**
 * QR Code API Types
 */

/**
 * QR Referral Code Response
 * Returns JPEG image data for the referral QR code
 */
export interface QRReferralResponse {
  // The response is a JPEG image, so we'll handle it as Blob
  data: Blob;
}

/**
 * Error Response for QR API
 */
export interface QRErrorResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId: string;
}

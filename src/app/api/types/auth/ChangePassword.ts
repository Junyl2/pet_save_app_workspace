/**
 * Change password request interface
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Change password response interface
 */
export interface ChangePasswordResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: {};
  errorId: string | null;
}

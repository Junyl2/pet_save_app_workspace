/**
 * Notification settings interface
 */
export interface NotificationSettings {
  enableInquiryNotif: boolean;
  enableExpiringPointsNotif: boolean;
  enablePushNotif: boolean;
  allowSmsReceive: boolean;
  allowEmailReceive: boolean;
}

/**
 * Notification settings API response interface
 */
export interface NotificationSettingsApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: NotificationSettings;
  errorId: string | null;
}

/**
 * Notification settings update request interface
 */
export interface NotificationSettingsUpdateRequest {
  enableInquiryNotif: boolean;
  enableExpiringPointsNotif: boolean;
  enablePushNotif: boolean;
  allowSmsReceive: boolean;
  allowEmailReceive: boolean;
}

/**
 * Notification settings update response interface
 */
export interface NotificationSettingsUpdateResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: NotificationSettings;
  errorId: string | null;
}

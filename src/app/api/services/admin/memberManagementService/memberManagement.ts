/**
 * Standard API response envelope
 */
export interface BaseApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId?: string;
}

/**
 * Request body for removing member permissions (non-admin)
 */
export interface RemoveMemberPermissionRequest {
  permission: string;
}

/**
 * Response for removing member permissions (non-admin)
 */
export interface RemoveMemberPermissionResponse extends BaseApiResponse {
  data: Record<string, unknown>;
}

/**
 * Response for deleting a member
 */
export interface DeleteMemberResponse extends BaseApiResponse {
  data: Record<string, unknown>;
}

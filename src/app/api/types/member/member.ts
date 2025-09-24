/**
 * Member information interface
 */
export interface MemberInfo {
  memberId: string; // Changed from 'id' to 'memberId' to match API response
  username?: string;
  email?: string;
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  role?: 'client' | 'seller';
  location?: string;
  deliveryAddress?: string;
  birthDate?: string;
  profileFileId?: string;
  loginType?: string;
  storeId?: string | null; // Store ID if user is a seller
  businessApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null; // Business registration approval status
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Member API response interface
 */
export interface MemberApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: MemberInfo;
  errorId: string | null;
}

/**
 * Member update request interface
 */
export interface MemberUpdateRequest {
  profileFileId?: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  birthDate?: string;
  deliveryAddress?: string;
}

/**
 * Member update response interface
 */
export interface MemberUpdateResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: MemberInfo;
  errorId: string | null;
}

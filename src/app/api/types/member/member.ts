/**
 * Member information interface
 */
export interface MemberInfo {
  id: string;
  username: string;
  email?: string;
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  role: 'client' | 'seller';
  location?: string;
  loginType?: string;
  storeId?: string | null; // Store ID if user is a seller
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
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  location?: string;
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

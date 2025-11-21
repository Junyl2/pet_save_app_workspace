/**
 * Member information interface (FULL DETAILS)
 */
export interface MemberInfo {
  memberId: string;
  username?: string;
  email?: string;
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  role?: 'client' | 'seller';
  location?: string;
  deliveryAddress?: string;
  birthdate?: string;
  profileFileId?: string;
  profileImageUrl?: string;
  loginType?: string;
  storeId?: string | null;

  businessApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;

  availablePointsBalance?: number;
  hasRecentReports?: boolean;
  numberOfReports?: number;

  referralCode?: string;

  zipCode?: string;
  roadAddress?: string;
  detailedAddress?: string;
  verifiedAt?: string;

  numberOfWishlists?: number;
  numberOfProducts?: number;
  numberOfReviewsMade?: number;
  numberOfReferrals?: number;

  defaultDeliveryAddress?: {
    deliveryAddressId: string;
    addressTitle?: string;
    receiverName?: string;
    receiverPhone?: string;
    roadAddress: string;
    detailedAddress: string;
    zipCode: string;
    default: boolean;
  };

  businessName?: string;
  businessRegistrationNumber?: string;
  representativeName?: string;
  businessRegistrationCopy?: string;
  businessAddress?: string;
  bankName?: string;
  accountNumber?: string;
  depositorName?: string;
  bankbook?: string;

  classification?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Member details response interface (GET /members/{id}/details)
 */
export interface MemberDetailsResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: MemberInfo;
  errorId: string | null;
}

/**
 * Member update request interface
 */
export interface MemberUpdateRequest {
  profileFileId?: string;
  profileImageUrl?: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  birthDate?: string;
  deliveryAddress?: string;

  // Newly added because PUT example includes these:
  nickname?: string;
  roadAddress?: string;
  detailedAddress?: string;
  zipCode?: string;
  businessRegistrationCopyId?: string;
  bankbookCopyId?: string;
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

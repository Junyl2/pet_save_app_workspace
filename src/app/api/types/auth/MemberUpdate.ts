/**
 * Member update request types for profile image updates
 */

export type MemberUpdateRequest = {
  name?: string;
  phone?: string;
  // Image by reference (upload first):
  profileImageFileId?: string; // UUID from /files/upload
  profileImageEncryptedId?: string; // encryptedId from /files/upload
  // Alternative field names that might be used by the server:
  profileFileId?: string; // Alternative naming
  imageId?: string; // Alternative naming
  imageFileId?: string; // Alternative naming
  // Server expects URL format - try multiple variations:
  profileImageUrl?: string; // URL format expected by server
  profileImage?: string; // Alternative URL field name
  imageUrl?: string; // Alternative URL field name
  image?: string; // Alternative URL field name
  avatar?: string; // Alternative URL field name
  avatarUrl?: string; // Alternative URL field name
  profilePicture?: string; // Alternative URL field name
  profilePictureUrl?: string; // Alternative URL field name
};

/**
 * Response type for member update operations
 */
export type MemberUpdateResponse = {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: {
    memberId: string;
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
    storeId?: string | null;
    businessApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    createdAt?: string;
    updatedAt?: string;
  };
  errorId: string | null;
};

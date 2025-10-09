/**
 * Delivery Address Types
 */

export interface DeliveryAddress {
  deliveryAddressId: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  default: boolean;
  label?: string;
  recipientName?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeliveryAddressRequest {
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  default: boolean;
}

export interface UpdateDeliveryAddressRequest {
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  isDefault: boolean;
}

export interface DeliveryAddressApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: DeliveryAddress | DeliveryAddress[] | object;
  errorId?: string;
}

export interface DeliveryAddressListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: DeliveryAddress[];
  errorId?: string;
}

export interface DeliveryAddressResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: DeliveryAddress;
  errorId?: string;
}

export interface DeliveryAddress {
  deliveryAddressId: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;

  /** Whether this address is the default one */
  default: boolean;

  /** API now requires/sends these fields */
  addressTitle: string;
  receiverName: string;
  receiverPhone: string;

  createdAt?: string;
  updatedAt?: string;
}

/** Create payload must include new required fields */
export interface CreateDeliveryAddressRequest {
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  default: boolean;

  addressTitle: string;
  receiverName: string;
  receiverPhone: string;
}

/** Update payload: allow partial updates; API uses isDefault */
export interface UpdateDeliveryAddressRequest {
  roadAddress?: string;
  detailedAddress?: string;
  zipCode?: string;
  isDefault?: boolean;

  addressTitle?: string;
  receiverName?: string;
  receiverPhone?: string;
}

/** Generic API response shapes (unchanged) */
export interface DeliveryAddressApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: DeliveryAddress | DeliveryAddress[] | Record<string, unknown>;
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

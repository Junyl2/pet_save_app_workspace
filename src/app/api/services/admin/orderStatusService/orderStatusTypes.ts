/** ────────────────  ORDER ITEM PREPARATION ──────────────── **/
export interface PrepareOrderItemResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}

/** ────────────────  ORDER ITEM CANCELLATION ──────────────── **/
export interface CancelOrderItemRequest {
  cancelReason: string;
}

export interface CancelOrderItemResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}

/** ────────────────  PICKUP START (테스트 전용) ──────────────── **/
export interface BeginPickupResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}

/** ────────────────  DELIVERY START (테스트 전용) ──────────────── **/
export interface BeginDeliveryRequest {
  trackingNumber: string;
}

export interface BeginDeliveryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}

/** ────────────────  ORDER ITEM COMPLETION (테스트 전용) ──────────────── **/
export interface CompleteOrderItemResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}

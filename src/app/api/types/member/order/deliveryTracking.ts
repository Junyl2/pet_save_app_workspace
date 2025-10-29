export interface DeliveryTrackingResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: DeliveryTrackingData;
  errorId?: string;
}

export interface DeliveryTrackingData {
  deliveryId: string;
  courierName: string;
  trackingNumber: string;
  orderId: string;
  orderNumber: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  currentStatus: string;
  items: DeliveryItem[];
  message: string;
  lastUpdated: string;
  events: DeliveryEvent[];
}

export interface DeliveryItem {
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  productImageIds: string[];
}

export interface DeliveryEvent {
  deliveryEventId: string;
  status: string;
  location: string | null;
  message: string;
  eventTime: string;
}

export interface DeliveryInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: DeliveryInfoData;
  errorId?: string;
}

export interface DeliveryInfoData {
  deliveryId: string;
  courierName: string;
  trackingNumber: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  deliveryNotes: string | null;
  currentStatus: string;
}

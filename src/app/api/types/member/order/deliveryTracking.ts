export interface DeliveryTrackingResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: DeliveryTrackingData;
  errorId: string;
}

export interface DeliveryTrackingData {
  trackingNumber: string;
  carrier: string;
  status: string;
  events: DeliveryEvent[];
  recipient: {
    name: string;
    address: string;
    phone: string;
  };
  estimatedDelivery?: string;
}

export interface DeliveryEvent {
  date: string;
  time: string;
  status: string;
  description: string;
  location?: string;
}

export interface DeliveryInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: DeliveryInfoData;
  errorId: string;
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

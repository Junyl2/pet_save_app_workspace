export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  brand: string;
  image: string;
}

export interface RefundData {
  selectedItems: string[];
  selectedReason: string;
  subReason?: string;
  detailReason?: string;
  returnMethod?: string;
}

export interface RefundStep {
  key: string;
  label: string;
}

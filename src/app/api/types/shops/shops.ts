export interface Shop {
  id: number;
  ownerId?: number;
  name: string;
  category: string;
  location: string;
  distance: string;
  shopName: string;
  shopLocation: string;
  shopDistance: string;
  image: string;
  phoneNumber: string;

  workingHours?: string;
  rating?: number;
}

import { mockProducts } from '../pages/products/mockProducts';
import { Shop } from '@/app/api/types/shops/shops';

const shopMap = new Map<string, Shop>();

mockProducts.forEach((p) => {
  const shopName = p.shopName ?? 'Unknown Shop';
  const shopLocation = p.shopLocation ?? '';
  const shopDistance = p.shopDistance ?? '';
  const shopImage = p.shopImage ?? '';
  const phoneNumber = p.phoneNumber ?? '';

  if (!shopMap.has(shopName)) {
    shopMap.set(shopName, {
      id: shopMap.size + 1,
      name: shopName,
      location: shopLocation,
      distance: shopDistance,
      image: shopImage,
      phoneNumber: phoneNumber,
    });
  }
});

export const mockShops: Shop[] = Array.from(shopMap.values());

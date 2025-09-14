import { mockProducts } from '../pages/products/mockProducts';
import { Shop } from '@/app/api/types/shops/shops';

const shopMap = new Map<string, Shop>();

mockProducts.forEach((p) => {
  const shopName = p.shopName ?? 'Unknown Shop';
  const shopLocation = p.shopLocation ?? '';
  const shopDistance = p.shopDistance ?? '';
  const shopImage = p.shopImage ?? '';
  const phoneNumber = p.phoneNumber ?? '';
  const category = p.category ?? '기타'; // add a default category

  if (!shopMap.has(shopName)) {
    shopMap.set(shopName, {
      id: shopMap.size + 1,
      name: shopName, // display name
      category, //  required by Shop
      location: shopLocation, // required by Shop
      distance: shopDistance, // required by Shop
      shopName, // required by Shop
      shopLocation, // required by Shop
      shopDistance, //  required by Shop
      image: shopImage,
      phoneNumber,
    });
  }
});

export const mockShops: Shop[] = Array.from(shopMap.values());

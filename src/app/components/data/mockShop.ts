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
    const tempId = shopMap.size + 1;
    shopMap.set(shopName, {
      id: tempId,
      ownerId: tempId,
      name: shopName, // display name
      category, //  required by Shop
      location: shopLocation, // required by Shop
      distance: shopDistance, // required by Shop
      shopName, // required by Shop
      shopLocation, // required by Shop
      shopDistance, //  required by Shop
      image: shopImage,
      phoneNumber,
    } as Shop & { ownerId: number });
  }
});

export const mockShops: Shop[] = Array.from(shopMap.values());

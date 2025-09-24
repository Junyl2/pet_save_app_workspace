import { Seller } from '@/app/api/types/seller/seller';
import { mockShops } from '@/app/components/data/mockShop';
import { mockProducts } from '@/app/components/pages/products/mockProducts';

class SellerService {
  async getSellerDetailsByShopId(shopId: number): Promise<Seller> {
    const shop = mockShops.find((s) => s.id === shopId);
    if (!shop) throw new Error(`Shop with id ${shopId} not found`);

    const products = mockProducts.filter((p) => p.shopName === shop.name);

    return {
      id: shop.id,
      ownerId: shop.ownerId, // taken from mockShop (no need to fallback to shop.id)
      name: shop.name,
      phoneNumber: shop.phoneNumber,
      workingHours: shop.workingHours ?? '09:00 - 18:00',
      location: shop.location,
      rating: shop.rating ?? 4.7,
      reviewCount: products.length,
      products,
    };
  }

  async getSellerDetails(): Promise<Seller> {
    // optional default (could even throw an error if no default shop is defined)
    return this.getSellerDetailsByShopId(mockShops[0].id);
  }
}

export const sellerService = new SellerService();

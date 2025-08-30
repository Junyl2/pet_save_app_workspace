import { Shop } from '@/app/api/types/shops/shops';
import { mockShops } from '@/app/components/data/mockShop';

class ShopService {
  private shops: Shop[];

  constructor() {
    this.shops = mockShops;
  }

  /** Get all shops */
  getAll(): Shop[] {
    return this.shops;
  }

  /** Get shop by ID */
  getById(id: number): Shop | undefined {
    return this.shops.find((shop) => shop.id === id);
  }

  /** Search shops by name */
  searchByName(term: string): Shop[] {
    const lower = term.toLowerCase();
    return this.shops.filter((shop) => shop.name.toLowerCase().includes(lower));
  }

  /** Add a new shop (mock) */
  addShop(shop: Shop): void {
    shop.id = this.shops.length + 1;
    this.shops.push(shop);
  }

  /** Remove shop by ID (mock) */
  removeById(id: number): void {
    this.shops = this.shops.filter((shop) => shop.id !== id);
  }

  /** Update shop by ID (mock) */
  updateShop(id: number, updated: Partial<Shop>): void {
    const index = this.shops.findIndex((shop) => shop.id === id);
    if (index !== -1) {
      this.shops[index] = { ...this.shops[index], ...updated };
    }
  }
}

export const shopService = new ShopService();

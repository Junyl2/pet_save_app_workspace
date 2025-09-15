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

  /** Get shop by name (exact) */
  getByName(name: string): Shop | undefined {
    return this.shops.find((shop) => shop.name === name);
  }

  /** Search shops by name (contains) */
  searchByName(term: string): Shop[] {
    const lower = term.toLowerCase();
    return this.shops.filter((shop) => shop.name.toLowerCase().includes(lower));
  }

  /** Convenience: parse route param and fetch */
  getByRouteParam(param: string | string[] | undefined): Shop | undefined {
    const raw = Array.isArray(param) ? param[0] : param;
    const id = Number(raw);
    if (!Number.isFinite(id)) return undefined;
    return this.getById(id);
  }

  /** Return the ownerId for a shop (or undefined) */
  getOwnerId(shopId: number): number | undefined {
    return this.getById(shopId)?.ownerId ?? this.getById(shopId)?.id;
  }

  /** Check if a given sellerId owns the shop */
  isOwner(shopId: number, sellerId?: number | null): boolean {
    if (!Number.isFinite(shopId) || !Number.isFinite(Number(sellerId)))
      return false;
    const ownerId = this.getOwnerId(shopId);
    return Number(ownerId) === Number(sellerId);
  }

  /** All shops owned by a seller */
  getByOwnerId(ownerId: number): Shop[] {
    return this.shops.filter(
      (s) => Number(s.ownerId ?? s.id) === Number(ownerId)
    );
  }

  /** Add a new shop (mock) */
  addShop(shop: Shop): void {
    const nextId = this.shops.length + 1;
    this.shops.push({
      ...shop,
      id: nextId,
      ownerId: shop.ownerId ?? nextId, // default mirror if not provided
    });
  }

  /** Remove shop by ID (mock) */
  removeById(id: number): void {
    this.shops = this.shops.filter((shop) => shop.id !== id);
  }

  /** Update shop by ID (mock) */
  updateShop(id: number, updated: Partial<Shop>): void {
    const index = this.shops.findIndex((shop) => shop.id === id);
    if (index !== -1) {
      this.shops[index] = {
        ...this.shops[index],
        ...updated,
        ownerId:
          updated.ownerId ?? this.shops[index].ownerId ?? this.shops[index].id,
      };
    }
  }
}

export const shopService = new ShopService();

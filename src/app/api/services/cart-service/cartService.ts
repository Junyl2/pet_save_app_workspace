import { ApiResponse } from '../../apiClient';

type CartItem = {
  productId: number;
  quantity: number;
};

// temporary in-memory cart
let cart: CartItem[] = [];

export const cartService = {
  addToCart: async (
    productId: number,
    quantity: number
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      await new Promise((res) => setTimeout(res, 200)); // simulate delay

      // check if already exists in cart
      const existing = cart.find((c) => c.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ productId, quantity });
      }

      return { data: { success: true } };
    } catch (error: any) {
      return { data: { success: false }, error: error.message };
    }
  },

  // (optional) get all cart items
  getCart: async (): Promise<ApiResponse<CartItem[]>> => {
    await new Promise((res) => setTimeout(res, 150));
    return { data: cart };
  },
};

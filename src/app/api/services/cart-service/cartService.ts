import { ApiResponse } from '../../apiClient';

type CartItem = {
  productId: string | number;
  quantity: number;
};

// temporary in-memory cart
const cart: CartItem[] = [];

export const cartService = {
  addToCart: async (
    productId: string | number,
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
    } catch (error: unknown) {
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      }
      return { data: { success: false }, error: message };
    }
  },

  // (optional) get all cart items
  getCart: async (): Promise<ApiResponse<CartItem[]>> => {
    await new Promise((res) => setTimeout(res, 150));
    return { data: cart };
  },
};

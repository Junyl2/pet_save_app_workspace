import { Product } from '../../types/products/products';
import { ApiResponse } from '../../apiClient';
import { mockProducts } from '@/app/components/pages/products/mockProducts';

export const productService = {
  // Fetch all products (mocked)
  getAll: async (): Promise<ApiResponse<Product[]>> => {
    try {
      // Simulate an API delay
      await new Promise((res) => setTimeout(res, 300));
      return { data: mockProducts };
    } catch (error: unknown) {
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      }
      return { data: [], error: message };
    }
  },

  // Fetch products by search term
  search: async (searchTerm: string): Promise<ApiResponse<Product[]>> => {
    try {
      await new Promise((res) => setTimeout(res, 300));
      const filtered = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { data: filtered };
    } catch (error: unknown) {
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      }
      return { data: [], error: message };
    }
  },

  // Fetch single product by ID
  getById: async (id: number): Promise<ApiResponse<Product | null>> => {
    try {
      await new Promise((res) => setTimeout(res, 200));
      const product = mockProducts.find((p) => p.id === id) || null;
      return { data: product };
    } catch (error: unknown) {
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      }
      return { data: null, error: message };
    }
  },
};

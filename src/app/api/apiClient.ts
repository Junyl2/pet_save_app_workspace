import { Product } from './types/products/products';
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export const apiClient = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      // In a real project, you could use fetch/axios here
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data: T = await response.json();
      return { data };
    } catch (error: any) {
      return { data: null as any, error: error.message };
    }
  },
};

export interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

export const apiClient = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data: T = await response.json();
      return { data, error: undefined };
    } catch (error: unknown) {
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      }
      return { data: null, error: message };
    }
  },
};

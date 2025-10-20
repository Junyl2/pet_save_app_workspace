import { useState, useCallback } from 'react';
import { StoreService } from '@/app/api/services/client/storeService/storeService';
import { StoreInfo } from '@/app/api/types/member/store/store';

interface UseStoreDetailsReturn {
  storeDetails: Record<string, StoreInfo>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  fetchStoreDetails: (storeId: string) => Promise<void>;
  getStoreDetails: (storeId: string) => StoreInfo | null;
  isLoading: (storeId: string) => boolean;
  hasError: (storeId: string) => boolean;
  getError: (storeId: string) => string | null;
}

/**
 * Custom hook to fetch and manage store details for products
 * Provides caching and loading states for multiple stores
 */
export const useStoreDetails = (): UseStoreDetailsReturn => {
  const [storeDetails, setStoreDetails] = useState<Record<string, StoreInfo>>(
    {}
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});

  /**
   * Fetch store details by storeId
   * @param storeId - The store ID to fetch details for
   */
  const fetchStoreDetails = useCallback(async (storeId: string) => {
    if (!storeId) {
      return;
    }

    console.log('🔍 Fetching store details for storeId:', storeId);

    // Set loading state
    setLoading((prev) => ({ ...prev, [storeId]: true }));
    setError((prev) => ({ ...prev, [storeId]: null }));

    try {
      // Use the store search endpoint to get store details
      // Call without keyword to get all stores with distance calculation
      const response = await StoreService.searchStores({
        page: 0,
        size: 10, // Get more results to find the specific store
        sortBy: 'distance', // Sort by distance to get closest stores
        direction: 'asc',
      });

      if (response.error) {
        console.error('❌ Failed to fetch store details:', response.error);
        setError((prev) => ({ ...prev, [storeId]: response.error || null }));
        setLoading((prev) => ({ ...prev, [storeId]: false }));
        return;
      }

      if (
        response.data?.data?.content &&
        response.data.data.content.length > 0
      ) {
        // Find the specific store by storeId
        const storeInfo = response.data.data.content.find(
          (store) => store.storeId === storeId
        );

        if (storeInfo) {
          console.log('✅ Store details fetched successfully:', {
            storeId: storeInfo.storeId,
            businessName: storeInfo.businessName,
            roadAddress: storeInfo.roadAddress,
            distanceKm: storeInfo.distanceKm,
          });

          setStoreDetails((prev) => ({ ...prev, [storeId]: storeInfo }));
        } else {
          console.warn('⚠️ Store not found in results for storeId:', storeId);
          setError((prev) => ({ ...prev, [storeId]: 'Store not found' }));
        }
      } else {
        console.warn('⚠️ No stores found');
        setError((prev) => ({ ...prev, [storeId]: 'No stores found' }));
      }
    } catch (err) {
      console.error('💥 Error fetching store details:', err);
      setError((prev) => ({
        ...prev,
        [storeId]:
          err instanceof Error ? err.message : 'Failed to fetch store details',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [storeId]: false }));
    }
  }, []);

  /**
   * Get store details from cache
   * @param storeId - The store ID
   * @returns StoreInfo or null if not found
   */
  const getStoreDetails = useCallback(
    (storeId: string): StoreInfo | null => {
      return storeDetails[storeId] || null;
    },
    [storeDetails]
  );

  /**
   * Check if store details are loading
   * @param storeId - The store ID
   * @returns boolean indicating loading state
   */
  const isLoading = useCallback(
    (storeId: string): boolean => {
      return loading[storeId] || false;
    },
    [loading]
  );

  /**
   * Check if there's an error for a store
   * @param storeId - The store ID
   * @returns boolean indicating error state
   */
  const hasError = useCallback(
    (storeId: string): boolean => {
      return !!error[storeId];
    },
    [error]
  );

  /**
   * Get error message for a store
   * @param storeId - The store ID
   * @returns error message or null
   */
  const getError = useCallback(
    (storeId: string): string | null => {
      return error[storeId] || null;
    },
    [error]
  );

  return {
    storeDetails,
    loading,
    error,
    fetchStoreDetails,
    getStoreDetails,
    isLoading,
    hasError,
    getError,
  };
};

'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { WishlistService } from '@/app/api/services/client/my-page/wishlistService';
import { WishlistItem } from '@/app/api/types/my-page/wishlist';
import toast from 'react-hot-toast';

type FavoritesContextType = {
  favorites: string[];
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  toggleFavorite: (id: string) => Promise<void>;
  loadWishlist: () => Promise<void>;
  isFavorited: (id: string) => boolean;
  clearError: () => void;
};

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  wishlistItems: [],
  isLoading: false,
  error: null,
  toggleFavorite: async () => {},
  loadWishlist: async () => {},
  isFavorited: () => false,
  clearError: () => {},
});

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wishlist from API on mount
  useEffect(() => {
    // Only load wishlist if we have a token (user is authenticated)
    const token = localStorage.getItem('authToken');
    if (token) {
      loadWishlist();
    }
  }, []);

  // Fallback: Load from localStorage on mount (for offline support)
  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored && favorites.length === 0) {
      try {
        const parsedFavorites = JSON.parse(stored);
        setFavorites(parsedFavorites);
      } catch (error) {
        console.error('Error parsing stored favorites:', error);
      }
    }
  }, []);

  // Save to localStorage on change (for offline support)
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await WishlistService.getWishlist();

      if (response.data && response.data.items) {
        console.log('Loaded wishlist items:', response.data.items.length);
        console.log(
          'Wishlist items:',
          response.data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
          }))
        );
        setWishlistItems(response.data.items);
        // Map wishlist items to product IDs (using productId field from API response)
        setFavorites(response.data.items.map((item) => item.productId));
      } else {
        // If no data or items, set empty arrays
        setWishlistItems([]);
        setFavorites([]);
        if (response.error) {
          console.warn('Wishlist API error:', response.error);
          // Don't set error for now, just use empty arrays
          // setError(response.error);
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Don't set error for now, just use empty arrays
      // setError('Failed to load wishlist');
      setWishlistItems([]);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  const toggleFavorite = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('로그인이 필요합니다.');
          return;
        }

        console.log('Auth token found:', !!token);
        console.log('Token preview:', token.substring(0, 20) + '...');

        // Check if token is expired
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const isExpired = payload.exp < currentTime;
          console.log('Token expiration check:', {
            exp: payload.exp,
            currentTime: currentTime,
            isExpired: isExpired,
            expiresIn:
              Math.round((payload.exp - currentTime) / 60) + ' minutes',
          });

          if (isExpired) {
            setError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
            return;
          }
        } catch (error) {
          console.error('Error parsing token:', error);
          setError('인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.');
          return;
        }

        const isCurrentlyFavorited = favorites.includes(id);
        console.log('Toggle favorite state:', {
          productId: id,
          isCurrentlyFavorited,
          action: isCurrentlyFavorited ? 'REMOVE' : 'ADD',
        });

        // Try to sync with API first
        try {
          const response = await WishlistService.toggleWishlist(
            id,
            isCurrentlyFavorited
          );

          if (response.data?.success) {
            // API call succeeded, reload wishlist to get accurate state from backend
            console.log('Toggle successful, reloading wishlist...');
            await loadWishlist();

            // Show success message based on the action
            if (isCurrentlyFavorited) {
              console.log('Removed from wishlist:', id);
            } else {
              console.log('Added to wishlist:', id);
            }
          } else {
            console.error('Wishlist API error:', response.error);
            setError(response.error || '찜목록 업데이트에 실패했습니다.');
          }
        } catch (apiError: any) {
          console.error('Wishlist API failed:', apiError);

          // Handle specific error cases
          if (apiError?.response?.status === 401) {
            const errorMsg = '로그인이 필요합니다.';
            setError(errorMsg);
            toast.error(errorMsg);
            // Clear invalid tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            // Optionally trigger login modal or redirect
            if (typeof window !== 'undefined') {
              // You can replace this with a login modal trigger
              console.log('Authentication required - should show login modal');
            }
          } else if (apiError?.response?.status === 500) {
            const errorMsg =
              '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            setError(errorMsg);
            toast.error(errorMsg);
          } else if (apiError?.response?.status === 404) {
            const errorMsg = '상품을 찾을 수 없습니다.';
            setError(errorMsg);
            toast.error(errorMsg);
          } else {
            const errorMsg = '찜목록 업데이트에 실패했습니다.';
            setError(errorMsg);
            toast.error(errorMsg);
          }
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        setError('찜목록 업데이트에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [favorites, loadWishlist]
  ); // Depend on favorites and loadWishlist

  const isFavorited = useCallback(
    (id: string) => {
      return favorites.includes(id);
    },
    [favorites]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        wishlistItems,
        isLoading,
        error,
        toggleFavorite,
        loadWishlist,
        isFavorited,
        clearError,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook
export const useFavorites = () => useContext(FavoritesContext);

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { WishlistService } from '@/app/api/services/client/my-page/wishlistService';
import { WishlistItem } from '@/app/api/types/my-page/wishlist';
import toast from 'react-hot-toast';
import { AxiosError, isAxiosError } from 'axios';

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

type JwtPayload = { exp: number; [k: string]: unknown };

const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setFavorites(response.data.items.map((item) => item.productId));
      } else {
        setWishlistItems([]);
        setFavorites([]);
        if (response.error) {
          console.warn('Wishlist API error:', response.error);
        }
      }
    } catch (err: unknown) {
      console.error('Error loading wishlist:', err);
      setWishlistItems([]);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load wishlist from API on mount (only if authenticated)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      void loadWishlist();
    } else {
      // Clear favorites if no auth token (user logged out)
      setFavorites([]);
      setWishlistItems([]);
    }
  }, [loadWishlist]); // ✅ include dependency

  // Fallback: Load from localStorage once on mount (for offline support)
  // Only load from localStorage if user is authenticated
  const didBootstrapLocalFavorites = useRef(false);
  useEffect(() => {
    if (didBootstrapLocalFavorites.current) return;
    didBootstrapLocalFavorites.current = true;

    const token = localStorage.getItem('authToken');
    if (!token) {
      // User is not authenticated, don't load from localStorage
      return;
    }

    const stored = localStorage.getItem('favorites');
    if (stored && favorites.length === 0) {
      try {
        const parsedFavorites = JSON.parse(stored) as unknown;
        if (Array.isArray(parsedFavorites)) {
          setFavorites(parsedFavorites as string[]);
        }
      } catch (err) {
        console.error('Error parsing stored favorites:', err);
      }
    }
  }, [favorites.length]); // ✅ include the value the effect reads

  // Save to localStorage whenever favorites change (for offline support)
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  // Listen for auth token changes to clear favorites when user logs out
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && e.newValue === null) {
        // Auth token was removed (user logged out)
        console.log('Auth token removed, clearing favorites');
        setFavorites([]);
        setWishlistItems([]);
        localStorage.removeItem('favorites');
      }
    };

    // Listen for storage events (when localStorage is modified from other tabs/contexts)
    window.addEventListener('storage', handleStorageChange);

    // Also check auth token on mount and when loadWishlist changes
    const checkAuthAndClear = () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setFavorites([]);
        setWishlistItems([]);
      }
    };

    checkAuthAndClear();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Check auth
        const token = localStorage.getItem('authToken');
        if (!token) {
          const msg = '로그인이 필요합니다.';
          setError(msg);
          toast.error(msg);
          return;
        }

        console.log('Auth token found:', !!token);
        console.log('Token preview:', token.substring(0, 20) + '...');

        // Check token expiry
        const payload = parseJwt(token);
        if (!payload || typeof payload.exp !== 'number') {
          const msg = '인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.';
          setError(msg);
          toast.error(msg);
          return;
        }
        const currentTime = Date.now() / 1000;
        const isExpired = payload.exp < currentTime;
        console.log('Token expiration check:', {
          exp: payload.exp,
          currentTime,
          isExpired,
          expiresIn: Math.round((payload.exp - currentTime) / 60) + ' minutes',
        });
        if (isExpired) {
          const msg = '로그인 세션이 만료되었습니다. 다시 로그인해주세요.';
          setError(msg);
          toast.error(msg);
          return;
        }

        const isCurrentlyFavorited = favorites.includes(id);
        console.log('Toggle favorite state:', {
          productId: id,
          isCurrentlyFavorited,
          action: isCurrentlyFavorited ? 'REMOVE' : 'ADD',
        });

        // Sync with API
        try {
          const response = await WishlistService.toggleWishlist(
            id,
            isCurrentlyFavorited
          );

          if (response.data?.success) {
            console.log('Toggle successful, reloading wishlist...');
            await loadWishlist();

            if (isCurrentlyFavorited) {
              console.log('Removed from wishlist:', id);
            } else {
              console.log('Added to wishlist:', id);
            }
          } else {
            console.error('Wishlist API error:', response.error);
            setError(response.error || '찜목록 업데이트에 실패했습니다.');
            toast.error(response.error || '찜목록 업데이트에 실패했습니다.');
          }
        } catch (apiErr: unknown) {
          console.error('Wishlist API failed:', apiErr);

          if (isAxiosError(apiErr)) {
            const status = (apiErr as AxiosError)?.response?.status;
            if (status === 401) {
              const msg = '로그인이 필요합니다.';
              setError(msg);
              toast.error(msg);
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              if (typeof window !== 'undefined') {
                console.log(
                  'Authentication required - should show login modal'
                );
              }
            } else if (status === 500) {
              const msg =
                '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
              setError(msg);
              toast.error(msg);
            } else if (status === 404) {
              const msg = '상품을 찾을 수 없습니다.';
              setError(msg);
              toast.error(msg);
            } else {
              const msg = '찜목록 업데이트에 실패했습니다.';
              setError(msg);
              toast.error(msg);
            }
          } else {
            const msg = '찜목록 업데이트에 실패했습니다.';
            setError(msg);
            toast.error(msg);
          }
        }
      } catch (err: unknown) {
        console.error('Error toggling favorite:', err);
        setError('찜목록 업데이트에 실패했습니다.');
        toast.error('찜목록 업데이트에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [favorites, loadWishlist]
  );

  const isFavorited = useCallback(
    (id: string) => favorites.includes(id),
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

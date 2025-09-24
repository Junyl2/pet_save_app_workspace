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

type FavoritesContextType = {
  favorites: string[];
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  toggleFavorite: (id: string) => Promise<void>;
  loadWishlist: () => Promise<void>;
  isFavorited: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  wishlistItems: [],
  isLoading: false,
  error: null,
  toggleFavorite: async () => {},
  loadWishlist: async () => {},
  isFavorited: () => false,
});

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wishlist from API on mount
  useEffect(() => {
    // Only load wishlist if we have a token (user is authenticated)
    const token = localStorage.getItem('accessToken');
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
        setWishlistItems(response.data.items);
        setFavorites(response.data.items.map((item) => item.id));
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

        const isCurrentlyFavorited = favorites.includes(id);

        // Always update the UI immediately for better UX
        if (isCurrentlyFavorited) {
          // Remove from favorites immediately
          setFavorites((prev) => prev.filter((f) => f !== id));
          setWishlistItems((prev) => prev.filter((item) => item.id !== id));
        } else {
          // Add to favorites immediately
          setFavorites((prev) => [...prev, id]);
        }

        // Try to sync with API in the background
        try {
          const response = await WishlistService.toggleWishlist(
            id,
            isCurrentlyFavorited
          );

          if (response.data?.success) {
            // API call succeeded, reload wishlist to get full data
            if (!isCurrentlyFavorited) {
              await loadWishlist();
            }
          } else {
            console.warn('Wishlist API error:', response.error);
            // API failed, but UI is already updated, so we're good
          }
        } catch (apiError) {
          console.warn(
            'Wishlist API failed, using localStorage only:',
            apiError
          );
          // API failed, but UI is already updated, so we're good
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        setError('Failed to update wishlist');
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
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook
export const useFavorites = () => useContext(FavoritesContext);

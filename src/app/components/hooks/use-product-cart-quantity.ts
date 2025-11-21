import { useState, useEffect } from 'react';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import { useAuth } from '@/app/context/authContext';
import { CartData } from '@/app/api/types/cart/cart';

const CART_UPDATE_EVENT = 'cartUpdated';

export const useProductCartQuantity = () => {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchCartData = async () => {
      if (!isLoggedIn) {
        setCartData(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await cartService.getCart();

        if (response.data?.success && response.data.data) {
          setCartData(response.data.data);
        } else {
          setCartData(null);
        }
      } catch (error) {
        console.error('Failed to fetch cart data:', error);
        setCartData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();

    const handleCartUpdate = () => {
      fetchCartData();
    };

    window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate);

    return () => {
      window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    };
  }, [isLoggedIn]);

  const getProductQuantity = (productId: string | number | undefined): number => {
    if (!cartData || !productId) return 0;

    const productIdStr = String(productId);

    for (const store of cartData.stores) {
      const cartItem = store.items.find(
        (item) => item.product.productId === productIdStr
      );
      if (cartItem) {
        return cartItem.quantity;
      }
    }

    return 0;
  };

  return { cartData, isLoading, getProductQuantity };
};


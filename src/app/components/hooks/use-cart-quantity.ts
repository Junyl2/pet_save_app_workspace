import { useState, useEffect } from 'react';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import { useAuth } from '@/app/context/authContext';

export const useCartQuantity = () => {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchCartQuantity = async () => {
      if (!isLoggedIn) {
        setTotalProducts(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await cartService.getCart();

        if (response.data?.success && response.data.data) {
          setTotalProducts(response.data.data.totalProducts);
        } else {
          setTotalProducts(0);
        }
      } catch (error) {
        console.error('Failed to fetch cart quantity:', error);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartQuantity();
  }, [isLoggedIn]);

  return { totalProducts, isLoading };
};

'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from './ShoppingCart.module.css';
import Image from 'next/image';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { DeleteModal } from '../../ui/modal/DeleteModal/DeleteModal';
import { useRouter } from 'next/navigation';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import { CartStore } from '@/app/api/types/cart/cart';
import { ToastMessage } from '@/app/components/ui/Toast/ToastMessage';
import Loading from '@/app/components/ui/Loading/Loading';
import { useAuth } from '@/app/context/authContext';

export default function ShoppingCartPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<null | {
    cartItemIds: string[];
    productIds: string[];
    type: 'single' | 'batch';
    reason?: 'quantity_decrease' | 'direct_delete';
  }>(null);
  const [apiCartStores, setApiCartStores] = useState<CartStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: '',
    isVisible: false,
  });

  // Helper function to show toast
  const showToast = (message: string) => {
    setToastMessage({ message, isVisible: true });
  };

  const hideToast = () => {
    setToastMessage((prev) => ({ ...prev, isVisible: false }));
  };

  // Helper function to refresh cart data
  const refreshCartData = async () => {
    try {
      const response = await cartService.getCart();
      if (response.data?.success && response.data.data?.stores) {
        setApiCartStores(response.data.data.stores);
      }
    } catch (err) {
      console.error('Failed to refresh cart data:', err);
    }
  };

  // Helper function to format date to Korean format (YY.MM.DD)
  // Example: "2025-09-27T00:00:00" -> "25.09.27"
  const formatKoreanDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString; // Return original if formatting fails
    }
  };

  // Helper function to check if a product is expired
  const isProductExpired = (expiryDate: string | null | undefined): boolean => {
    if (!expiryDate) return false;

    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      return expiry < today;
    } catch (error) {
      console.error('Error parsing expiry date:', expiryDate, error);
      return false;
    }
  };

  // Helper function to filter out expired products
  const filterExpiredProducts = (items: typeof displayCart) => {
    const validItems = items.filter(({ product }) => {
      if (isProductExpired(product.expiration)) {
        console.log(
          `Product ${product.name} is expired: ${formatKoreanDate(
            product.expiration
          )}`
        );
        return false;
      }
      return true;
    });

    const expiredItems = items.filter(({ product }) =>
      isProductExpired(product.expiration)
    );

    return { validItems, expiredItems };
  };

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
  }, [isLoggedIn, router]);

  // Fetch cart data from API
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await cartService.getCart();

        console.log('Cart API Response:', response);

        if (response.data?.success && response.data.data?.stores) {
          console.log('Cart data received:', response.data.data);
          console.log(
            'Product IDs in cart:',
            response.data.data.stores.map((store) =>
              store.items.map((item) => ({
                cartItemId: item.cartItemId,
                productId: item.product.productId,
                productName: item.product.productName,
                expiryDate: item.product.expiryDate,
              }))
            )
          );
          setApiCartStores(response.data.data.stores);
        } else if (response.error) {
          // Check if the error indicates authentication issues
          if (
            response.error.includes('401') ||
            response.error.includes('403') ||
            response.error.includes('Unauthorized') ||
            response.error.includes('Forbidden')
          ) {
            router.push('/login');
            return;
          }
          setError('장바구니 데이터를 불러올 수 없습니다');
        } else {
          setError('장바구니 데이터를 불러올 수 없습니다');
        }
      } catch (err) {
        console.error('Failed to fetch cart data:', err);

        // Check if it's an authentication error
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number } };
          if (
            axiosError.response?.status === 401 ||
            axiosError.response?.status === 403
          ) {
            // User is not authenticated, redirect to login
            router.push('/login');
            return;
          }
        }

        setError('장바구니 데이터를 불러오는 중 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchCartData();
    }
  }, [isLoggedIn, router]);

  // Interface for cart item structure
  interface CartItem {
    product: {
      id: string;
      cartItemId: string;
      name: string;
      price: number;
      image: string;
      shopName: string;
      storeId: string;
      discountPrice: number | null;
      expiration: string | null;
    };
    quantity: number;
  }

  // Convert API cart stores to the format expected by the existing cart context
  const convertedCart = useMemo(() => {
    const allItems: CartItem[] = [];

    apiCartStores.forEach((store) => {
      store.items.forEach((item) => {
        allItems.push({
          product: {
            id: item.product.productId, // Use productId as string for API operations
            cartItemId: item.cartItemId, // Keep cartItemId for reference
            name: item.product.productName,
            price: item.product.salePrice,
            image:
              item.product.productThumbnail ||
              '/images/products/placeholder.png',
            shopName: store.store.name,
            storeId: store.store.storeId,
            discountPrice: item.product.discountedPrice,
            expiration: item.product.expiryDate,
          },
          quantity: item.quantity,
        });
      });
    });

    return allItems;
  }, [apiCartStores]);

  // Use only API cart data - no fallback to context cart
  const displayCart = convertedCart;

  // ✅ safe number helper
  const num = (v: unknown): number => {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const parsed = parseFloat(v.replace(/[^\d.]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  // group by shop - use only API store data
  // Filter out stores with no items or only expired items
  const grouped = useMemo(() => {
    const map: Record<string, CartItem[]> = {};
    apiCartStores.forEach((store) => {
      // Filter out expired items
      const validItems = store.items.filter(
        (item) => !isProductExpired(item.product.expiryDate)
      );

      // Only add store if it has at least one valid (non-expired) item
      if (validItems.length > 0) {
        const storeName = store.store.name;
        map[storeName] = validItems.map((item) => ({
          product: {
            id: item.product.productId, // Use productId as string for API operations
            cartItemId: item.cartItemId, // Keep cartItemId for reference
            name: item.product.productName,
            price: item.product.salePrice,
            image:
              item.product.productThumbnail || '/images/products/placeholder.png',
            shopName: store.store.name,
            storeId: store.store.storeId,
            discountPrice: item.product.discountedPrice,
            expiration: item.product.expiryDate,
          },
          quantity: item.quantity,
        }));
      }
    });
    return map;
  }, [apiCartStores]);

  // Handle quantity update using API
  const handleQuantityUpdate = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    try {
      setIsUpdating(true);
      const response = await cartService.updateCartItemQuantity(
        cartItemId,
        newQuantity
      );

      if (response.data?.success) {
        await refreshCartData();
      } else {
        showToast('수량 업데이트에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      showToast('수량 업데이트 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle single item deletion using API
  const handleSingleItemDelete = async (
    cartItemId: string,
    productId: string
  ) => {
    try {
      setIsUpdating(true);
      console.log(
        'Attempting to delete single item with cartItemId:',
        cartItemId,
        'productId:',
        productId
      );

      // Log current cart data before deletion
      console.log('Current cart stores before deletion:', apiCartStores);
      const allCartItemIds = apiCartStores.flatMap((store) =>
        store.items.map((item) => ({
          cartItemId: item.cartItemId,
          productId: item.product.productId,
          productName: item.product.productName,
        }))
      );
      console.log('All available cart items before deletion:', allCartItemIds);

      // Verify the cartItemId exists in current cart data
      const itemExists = apiCartStores.some((store) =>
        store.items.some((item) => item.cartItemId === cartItemId)
      );

      if (!itemExists) {
        console.error('Cart item not found in current data:', cartItemId);
        console.log(
          'Available cartItemIds:',
          allCartItemIds.map((item) => item.cartItemId)
        );
        showToast('장바구니 항목을 찾을 수 없습니다');
        return;
      }

      console.log('Proceeding with deletion using cartItemId:', cartItemId);
      const response = await cartService.deleteCartItem(cartItemId);
      console.log('Delete response:', response);

      // Check if deletion was successful
      // If there's no error, consider it successful (HTTP 200/204)
      // Also check for explicit success field if present
      const isSuccess = !response.error && response.data?.success !== false;

      if (isSuccess) {
        console.log('Delete successful, refreshing cart data...');
        await refreshCartData();
        // Remove from selected items if it was selected
        setSelectedItems((prev) => prev.filter((id) => id !== productId));
        showToast('상품이 삭제되었습니다');
      } else {
        console.error(
          'Delete failed:',
          response.data,
          'Error:',
          response.error
        );
        showToast('상품 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      showToast('상품 삭제 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle batch deletion using API
  const handleBatchDelete = async (
    cartItemIds: string[],
    productIds: string[]
  ) => {
    if (cartItemIds.length === 0) {
      showToast('삭제할 항목을 찾을 수 없습니다');
      return;
    }

    try {
      setIsUpdating(true);
      console.log(
        'Attempting to batch delete items with cartItemIds:',
        cartItemIds,
        'productIds:',
        productIds
      );
      const response = await cartService.batchDeleteCartItems(cartItemIds);
      console.log('Batch delete response:', response);

      // Check if batch deletion was successful
      // If there's no error, consider it successful (HTTP 200/204)
      // Also check for explicit success field if present
      const isSuccess = !response.error && response.data?.success !== false;

      if (isSuccess) {
        await refreshCartData();
        // Remove from selected items
        setSelectedItems((prev) =>
          prev.filter((id) => !productIds.includes(id))
        );
        showToast(`${cartItemIds.length}개 상품이 삭제되었습니다`);
      } else {
        console.error(
          'Batch delete failed:',
          response.data,
          'Error:',
          response.error
        );
        showToast('상품 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to batch delete items:', error);
      showToast('상품 삭제 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOrder = (items: typeof displayCart) => {
    const selected = items.filter(
      ({ product }) =>
        product.id !== undefined && selectedItems.includes(product.id)
    );
    if (selected.length === 0) return;

    // Check for expired products before proceeding
    const { validItems, expiredItems } = filterExpiredProducts(selected);

    // If there are expired items, show a warning but don't remove them from selection
    if (expiredItems.length > 0) {
      console.log('Warning: Some selected items are expired:', expiredItems);
      // Don't modify selectedItems state - let user see expired items in delivery-payment page
    }

    // Use valid items (non-expired) for checkout, but keep all selected items in localStorage
    // The delivery-payment page can handle showing warnings for expired items
    const itemsToCheckout = validItems.length > 0 ? validItems : selected;

    // Store order data for delivery payment page
    localStorage.setItem('checkoutItems', JSON.stringify(itemsToCheckout));

    // Navigate to delivery payment page
    router.push('/shopping-cart/delivery-payment');
  };

  // calculate per-store summary safely
  const calcStoreSummary = (items: typeof displayCart) => {
    let original = 0;
    let discount = 0;
    let final = 0;

    items.forEach(({ product, quantity }) => {
      // Only include non-expired products that are selected
      if (
        product.id === undefined ||
        !selectedItems.includes(product.id) ||
        isProductExpired(product.expiration)
      )
        return;

      const base = num(product.price);
      const disc =
        product.discountPrice != null ? num(product.discountPrice) : null;

      const unitOriginal = base * quantity;
      const unitFinal = (disc ?? base) * quantity;
      const unitDiscount = (base - (disc ?? base)) * quantity;

      original += unitOriginal;
      discount += unitDiscount;
      final += unitFinal;
    });

    return { original, discount, final };
  };

  // calculate global summary
  const globalSummary = Object.values(grouped).reduce(
    (acc, items) => {
      const s = calcStoreSummary(items);
      acc.original += s.original;
      acc.discount += s.discount;
      acc.final += s.final;
      return acc;
    },
    { original: 0, discount: 0, final: 0 }
  );

  // Show loading state
  if (isLoading) {
    return <Loading />;
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.emptyContainer}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  // empty state - check if there are any stores with valid items
  if (Object.keys(grouped).length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Image
          src="/images/icons/cart-result.svg"
          alt="Cart is Empty"
          height={64}
          width={64}
        />
        <p className={styles.emptyMessage}>장바구니에 담긴 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {Object.entries(grouped).map(([store, items]) => {
        const { original, discount, final } = calcStoreSummary(items);
        const hasSelection = final > 0;

        // Only consider non-expired products for select all functionality
        const validStoreItemProductIds = items
          .filter(({ product }) => !isProductExpired(product.expiration))
          .map(({ product }) => product.id)
          .filter((id): id is string => id !== undefined);

        const isAllSelected =
          validStoreItemProductIds.length > 0 &&
          validStoreItemProductIds.every((id) => selectedItems.includes(id));

        const toggleSelectAllInStore = () => {
          if (isAllSelected) {
            setSelectedItems((prev) =>
              prev.filter((id) => !validStoreItemProductIds.includes(id))
            );
          } else {
            setSelectedItems((prev) => [
              ...prev,
              ...validStoreItemProductIds.filter((id) => !prev.includes(id)),
            ]);
          }
        };

        const toggleSelectItem = (productId: string) => {
          setSelectedItems((prev) =>
            prev.includes(productId)
              ? prev.filter((i) => i !== productId)
              : [...prev, productId]
          );
        };

        return (
          <div key={store} className={styles.storeBlock}>
            <div className={styles.storeHeader}>
              <div className={styles.selectAndStoreName}>
                <div>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAllInStore}
                    className={styles.checkbox}
                  />
                </div>
                <h2 className={styles.storeName}>{store}</h2>
              </div>

              <button
                onClick={() => {
                  // Only include non-expired products in batch delete
                  const validItems = items.filter(
                    ({ product }) => !isProductExpired(product.expiration)
                  );
                  const productIds = validItems
                    .map(({ product }) => product.id)
                    .filter((id): id is string => id !== undefined);
                  const cartItemIds = validItems
                    .map(({ product }) => product.cartItemId)
                    .filter((id): id is string => id !== undefined);

                  setDeleteTarget({
                    cartItemIds,
                    productIds,
                    type: 'batch',
                  });
                }}
                className={styles.bulkDeleteButton}
                disabled={isUpdating}
              >
                묶음삭제
              </button>
            </div>
            <div className={styles.separator}></div>

            {items.map(({ product, quantity }) => {
              const basePrice = num(product.price);
              const discounted =
                product.discountPrice != null
                  ? num(product.discountPrice)
                  : null;

              return (
                <div
                  key={product.cartItemId}
                  className={`${styles.item} ${
                    isProductExpired(product.expiration)
                      ? styles.expiredItem
                      : ''
                  }`}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={
                        product.id !== undefined &&
                        selectedItems.includes(product.id)
                      }
                      onChange={() =>
                        product.id !== undefined && toggleSelectItem(product.id)
                      }
                      className={styles.checkbox}
                    />
                  </div>
                  <div className={styles.left}>
                    <div className={styles.thumb}>
                      <Image
                        src={
                          product.image ?? '/images/products/placeholder.png'
                        }
                        alt={product.name || 'Product Image'}
                        width={80}
                        height={80}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.right}>
                    <div className={styles.info}>
                      <h3>{product.name}</h3>
                      <p>{product.shopName}</p>
                      {product.expiration && (
                        <p
                          className={
                            isProductExpired(product.expiration)
                              ? styles.expiredDate
                              : ''
                          }
                        >
                          {formatKoreanDate(product.expiration)}까지
                          {isProductExpired(product.expiration) && ' (만료됨)'}
                        </p>
                      )}
                    </div>

                    <div className={styles.priceSection}>
                      {discounted !== null ? (
                        <>
                          <span className={styles.original}>
                            {basePrice.toLocaleString()}원
                          </span>
                          <span className={styles.discount}>
                            할인가 {discounted.toLocaleString()}원
                          </span>
                        </>
                      ) : (
                        <span>{basePrice.toLocaleString()}원</span>
                      )}
                      <div className={styles.quantityControls}>
                        <button
                          onClick={() => {
                            if (product.cartItemId) {
                              if (quantity > 1) {
                                // Decrease quantity
                                handleQuantityUpdate(
                                  product.cartItemId,
                                  quantity - 1
                                );
                              } else if (quantity === 1) {
                                // Remove item when quantity is 1
                                if (product.id !== undefined) {
                                  setDeleteTarget({
                                    cartItemIds: [product.cartItemId],
                                    productIds: [product.id],
                                    type: 'single',
                                    reason: 'quantity_decrease',
                                  });
                                }
                              }
                            }
                          }}
                          disabled={isUpdating}
                        >
                          <FiMinus size={18} color="rgba(0,0,0,0.4)" />
                        </button>
                        <span style={{ color: 'rgba(0,0,0,0.8)' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (product.cartItemId) {
                              handleQuantityUpdate(
                                product.cartItemId,
                                quantity + 1
                              );
                            }
                          }}
                          disabled={isUpdating}
                        >
                          <FiPlus size={18} color="rgba(0,0,0,0.4)" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.deleteButton}>
                    <button
                      onClick={() => {
                        if (
                          product.id !== undefined &&
                          product.cartItemId !== undefined
                        ) {
                          console.log(
                            'Setting delete target for single item:',
                            {
                              productId: product.id,
                              cartItemId: product.cartItemId,
                              productName: product.name,
                            }
                          );
                          setDeleteTarget({
                            cartItemIds: [product.cartItemId],
                            productIds: [product.id],
                            type: 'single',
                            reason: 'direct_delete',
                          });
                        }
                      }}
                      className={styles.oneDelete}
                      disabled={isUpdating}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Store Summary */}
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>선택상품금액</span>
                <span>{original.toLocaleString()}원</span>
              </div>
              <div className={styles.summaryRow}>
                <span>할인예상금액</span>
                <span className={styles.estimateDiscount}>
                  {discount.toLocaleString()}원
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>주문금액</span>
                <span>{final.toLocaleString()}원</span>
              </div>
              <button
                disabled={!hasSelection}
                onClick={() => handleOrder(items)}
                className={
                  !hasSelection ? styles.disabledButton : styles.enabledButton
                }
              >
                {`총 ${
                  items.filter(
                    ({ product }) =>
                      product.id !== undefined &&
                      selectedItems.includes(product.id) &&
                      !isProductExpired(product.expiration)
                  ).length
                }건 주문하기`}
              </button>
            </div>
          </div>
        );
      })}

      {/* Global Summary */}
      <div className={styles.globalSummary}>
        <div className={styles.totalSummary}>
          <p>총 {selectedItems.length}건 주문금액 </p>
          <p>{globalSummary.final.toLocaleString()}원</p>
        </div>
        <button
          disabled={selectedItems.length === 0}
          onClick={() => handleOrder(displayCart)}
          className={
            selectedItems.length === 0
              ? styles.disabledButton
              : styles.enabledButton
          }
        >
          {`총 ${
            displayCart.filter(
              ({ product }) =>
                product.id !== undefined &&
                selectedItems.includes(product.id) &&
                !isProductExpired(product.expiration)
            ).length
          }건 주문하기`}
        </button>
      </div>

      {/* Delete Confirm Modal */}
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        modalTitle={
          deleteTarget?.reason === 'quantity_decrease'
            ? '이 상품을 삭제하시겠습니까?'
            : '상품을 삭제하시겠습니까?'
        }
        onDelete={async () => {
          if (deleteTarget) {
            if (deleteTarget.type === 'single') {
              await handleSingleItemDelete(
                deleteTarget.cartItemIds[0],
                deleteTarget.productIds[0]
              );
            } else {
              await handleBatchDelete(
                deleteTarget.cartItemIds,
                deleteTarget.productIds
              );
            }
            setDeleteTarget(null);
          }
        }}
      />

      {/* Custom Toast Message */}
      {toastMessage.isVisible && (
        <ToastMessage
          message={toastMessage.message}
          onClose={hideToast}
          duration={1500}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from './ShoppingCart.module.css';
import Image from 'next/image';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { DeleteModal } from '../../ui/modal/DeleteModal/DeleteModal';
import { useRouter } from 'next/navigation';
import { cartService } from '@/app/api/services/client/cartService/cartService';
import { CartItem, CartStore } from '@/app/api/types/cart/cart';
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
  const [toast, setToast] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: '',
    isVisible: false,
  });

  // Helper function to show toast
  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
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
          const axiosError = err as any;
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
  }, [isLoggedIn]);

  // Convert API cart stores to the format expected by the existing cart context
  const convertedCart = useMemo(() => {
    const allItems: any[] = [];

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
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    apiCartStores.forEach((store) => {
      const storeName = store.store.name;
      map[storeName] = store.items.map((item) => ({
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
      // The API returns empty string '' on successful deletion, or an error object on failure
      const isSuccess =
        (response.data as any) === '' || response.data?.success === true;

      if (isSuccess && !response.error) {
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
      // The API returns empty string '' on successful deletion, or an error object on failure
      const isSuccess =
        (response.data as any) === '' || response.data?.success === true;

      if (isSuccess && !response.error) {
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
    localStorage.setItem('checkoutItems', JSON.stringify(selected));
    router.push('/shopping-cart/delivery-payment');
  };

  // calculate per-store summary safely
  const calcStoreSummary = (items: typeof displayCart) => {
    let original = 0;
    let discount = 0;
    let final = 0;

    items.forEach(({ product, quantity }) => {
      if (product.id === undefined || !selectedItems.includes(product.id))
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

  // empty state
  if (displayCart.length === 0) {
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

        const storeItemProductIds = items
          .map(({ product }) => product.id)
          .filter((id): id is string => id !== undefined);
        const isAllSelected = storeItemProductIds.every((id) =>
          selectedItems.includes(id)
        );

        const toggleSelectAllInStore = () => {
          if (isAllSelected) {
            setSelectedItems((prev) =>
              prev.filter((id) => !storeItemProductIds.includes(id))
            );
          } else {
            setSelectedItems((prev) => [
              ...prev,
              ...storeItemProductIds.filter((id) => !prev.includes(id)),
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
                  const productIds = items
                    .map(({ product }) => product.id)
                    .filter((id): id is string => id !== undefined);
                  const cartItemIds = items
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
                <div key={product.cartItemId} className={styles.item}>
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
                      />
                    </div>
                  </div>

                  <div className={styles.right}>
                    <div className={styles.info}>
                      <h3>{product.name}</h3>
                      <p>{product.shopName}</p>
                      {product.expiration && <p>{product.expiration}까지</p>}
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
                총{' '}
                {
                  items.filter(
                    ({ product }) =>
                      product.id !== undefined &&
                      selectedItems.includes(product.id)
                  ).length
                }
                건 주문하기
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
          총 {selectedItems.length}건 주문하기
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
      {toast.isVisible && (
        <ToastMessage
          message={toast.message}
          onClose={hideToast}
          duration={1500}
        />
      )}
    </div>
  );
}

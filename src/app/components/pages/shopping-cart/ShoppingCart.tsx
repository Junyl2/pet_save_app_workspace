'use client';

import { useState, useMemo } from 'react';
import { useCart } from '@/app/context/cartContext';
import styles from './ShoppingCart.module.css';
import Image from 'next/image';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { DeleteModal } from '../../ui/modal/DeleteModal/DeleteModal';
import { useRouter } from 'next/navigation';

export default function ShoppingCartPage() {
  const router = useRouter();
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useCart();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<null | { ids: number[] }>(
    null
  );

  // ✅ safe number helper
  const num = (v: unknown): number => {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const parsed = parseFloat(v.replace(/[^\d.]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  // group by shop
  const grouped = useMemo(() => {
    const map: Record<string, typeof cart> = {};
    cart.forEach((item) => {
      const shop = item.product.shopName ?? '기타';
      if (!map[shop]) map[shop] = [];
      map[shop].push(item);
    });
    return map;
  }, [cart]);

  const handleOrder = (items: typeof cart) => {
    const selected = items.filter(({ product }) =>
      selectedItems.includes(product.id)
    );
    if (selected.length === 0) return;
    localStorage.setItem('checkoutItems', JSON.stringify(selected));
    router.push('/shopping-cart/delivery-payment');
  };

  // calculate per-store summary safely
  const calcStoreSummary = (items: typeof cart) => {
    let original = 0;
    let discount = 0;
    let final = 0;

    items.forEach(({ product, quantity }) => {
      if (!selectedItems.includes(product.id)) return;

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

  // empty state
  if (cart.length === 0) {
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

        const storeItemIds = items.map(({ product }) => product.id);
        const isAllSelected = storeItemIds.every((id) =>
          selectedItems.includes(id)
        );

        const toggleSelectAllInStore = () => {
          if (isAllSelected) {
            setSelectedItems((prev) =>
              prev.filter((id) => !storeItemIds.includes(id))
            );
          } else {
            setSelectedItems((prev) => [
              ...prev,
              ...storeItemIds.filter((id) => !prev.includes(id)),
            ]);
          }
        };

        const toggleSelectItem = (id: number) => {
          setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
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
                onClick={() =>
                  setDeleteTarget({
                    ids: items.map(({ product }) => product.id),
                  })
                }
                className={styles.bulkDeleteButton}
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
                <div key={product.id} className={styles.item}>
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.id)}
                      onChange={() => toggleSelectItem(product.id)}
                      className={styles.checkbox}
                    />
                  </div>
                  <div className={styles.left}>
                    <div className={styles.thumb}>
                      <Image
                        src={
                          product.image ?? '/images/products/placeholder.png'
                        }
                        alt={product.name}
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
                        <button onClick={() => decreaseQuantity(product.id)}>
                          <FiMinus size={18} color="rgba(0,0,0,0.4)" />
                        </button>
                        <span style={{ color: 'rgba(0,0,0,0.8)' }}>
                          {quantity}
                        </span>
                        <button onClick={() => increaseQuantity(product.id)}>
                          <FiPlus size={18} color="rgba(0,0,0,0.4)" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.deleteButton}>
                    <button
                      onClick={() => setDeleteTarget({ ids: [product.id] })}
                      className={styles.oneDelete}
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
                  items.filter(({ product }) =>
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
          onClick={() => handleOrder(cart)}
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
        modalTitle="상품을 삭제하시겠습니까?"
        onDelete={() => {
          if (deleteTarget) {
            deleteTarget.ids.forEach((id) => removeFromCart(id));
          }
        }}
      />
    </div>
  );
}

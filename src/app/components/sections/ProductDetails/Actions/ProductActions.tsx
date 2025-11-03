'use client';
import { useState } from 'react';
import styles from './ProductActions.module.css';
import { ProductDrawer } from '@/app/components/ui/drawer/ProductDrawer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProductActionsProps {
  productId: string | number;
  productName: string;
  productPrice: number | string;
  storeId?: string;
  onAddToCart: (quantity: number, productName: string) => void;
  onPurchase: (quantity: number, productName: string) => void;
}

export const ProductActions = ({
  productId,
  productName,
  productPrice,
  storeId,
  onAddToCart,
}: ProductActionsProps) => {
  const route = useRouter();
  const [showDrawer, setShowDrawer] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [drawerMode, setDrawerMode] = useState<'buy' | 'cart'>('buy');

  const [activeProduct, setActiveProduct] = useState<{
    id: string;
    name: string;
    price: number;
    storeId?: string;
  } | null>(null);

  const openDrawer = (
    id: string | number,
    name: string,
    price: number | string,
    mode: 'buy' | 'cart'
  ) => {
    // ✅ Ensure correct types for ProductDrawer
    const normalizedId = String(id);
    const normalizedPrice =
      typeof price === 'string' ? parseFloat(price) || 0 : price;

    setActiveProduct({
      id: normalizedId,
      name,
      price: normalizedPrice,
      storeId,
    });
    setQuantity(1);
    setDrawerMode(mode);
    setShowDrawer(true);
  };

  return (
    <div className={styles.actionsContainer}>
      {/* Bottom Actions */}
      <div className={styles.actions}>
        <button
          className={styles.messageButton}
          onClick={() => route.push(`/contact-product?productId=${productId}`)}
        >
          <Image
            src="/images/icons/bottom-bar/message.svg"
            alt="Message Icon"
            height={20}
            width={20}
          />
        </button>

        <button
          onClick={() =>
            openDrawer(productId, productName, productPrice, 'cart')
          }
          className={styles.addToCart}
        >
          장바구니 담기
        </button>

        <button
          onClick={() =>
            openDrawer(productId, productName, productPrice, 'buy')
          }
          className={styles.purchaseButton}
        >
          구매하기
        </button>
      </div>

      {/* Drawer Component */}
      <ProductDrawer
        show={showDrawer}
        product={activeProduct}
        quantity={quantity}
        setQuantity={setQuantity}
        onClose={() => setShowDrawer(false)}
        onAddToCart={onAddToCart}
        mode={drawerMode}
      />
    </div>
  );
};

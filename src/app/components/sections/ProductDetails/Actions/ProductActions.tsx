'use client';
import { useState } from 'react';
import styles from './ProductActions.module.css';
import { ProductDrawer } from '@/app/components/ui/drawer/ProductDrawer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProductActionsProps {
  productId: number; // add id
  productName: string;
  productPrice: number | string; // support both string/number
  onAddToCart: (quantity: number, productName: string) => void;
  onPurchase: (quantity: number, productName: string) => void;
}

export const ProductActions = ({
  productId,
  productName,
  productPrice,
  onAddToCart,
}: /*   onPurchase, */
ProductActionsProps) => {
  const route = useRouter();
  const [showDrawer, setShowDrawer] = useState(false);
  const [quantity, setQuantity] = useState(1);
  /*   const [onMessageProduct, setOnMessageProduct] = useState(false); */
  const [activeProduct, setActiveProduct] = useState<{
    id: number;
    name: string;
    price: number | string;
  } | null>(null);

  const openDrawer = (id: number, name: string, price: number | string) => {
    setActiveProduct({ id, name, price });
    setQuantity(1);
    setShowDrawer(true);
  };

  /*  useEffect(() => {
    const onMessage = route.push('/client/pages/products/contact-product');
  }, []); */

  return (
    <div className={styles.actionsContainer}>
      {/* Bottom Actions */}
      <div className={styles.actions}>
        <button
          className={styles.messageButton}
          onClick={() => route.push('/contact-product')}
        >
          <Image
            src="/images/icons/bottom-bar/message.svg"
            alt="Message Icon"
            height={20}
            width={20}
          />
        </button>

        <button
          onClick={() => openDrawer(productId, productName, productPrice)}
          className={styles.addToCart}
        >
          장바구니 담기
        </button>

        <button
          onClick={() => openDrawer(productId, productName, productPrice)}
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
      />
    </div>
  );
};

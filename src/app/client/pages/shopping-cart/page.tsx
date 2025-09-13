import TopBar from '@/app/components/sections/TopBar/TopBar';
import ShoppingCartPage from '@/app/components/pages/shopping-cart/ShoppingCart';
import styles from './page.module.css';
export default function ShoppingCart() {
  return (
    <>
      <TopBar />
      <main className={styles.mainContainer}>
        <ShoppingCartPage />
      </main>
    </>
  );
}

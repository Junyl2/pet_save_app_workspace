import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import styles from '../DeliveryPayment.module.css';

interface CartSummaryProps {
  itemCount: number;
  isOpen: boolean;
  toggleOpen: () => void;
}

export default function CartSummary({
  itemCount,
  isOpen,
  toggleOpen,
}: CartSummaryProps) {
  return (
    <h2
      className={styles.pageTitle}
      onClick={toggleOpen}
      style={{ cursor: 'pointer' }}
    >
      주문상품 총 {itemCount}개 {isOpen ? <FaChevronUp /> : <FaChevronDown />}
    </h2>
  );
}

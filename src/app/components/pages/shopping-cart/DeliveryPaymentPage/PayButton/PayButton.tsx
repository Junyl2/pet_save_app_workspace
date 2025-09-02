import styles from '../DeliveryPayment.module.css';

interface PayButtonProps {
  totalDue: number;
  canPay: boolean;
  handlePay: () => void;
}

export default function PayButton({
  totalDue,
  canPay,
  handlePay,
}: PayButtonProps) {
  return (
    <button
      className={`${styles.payButton} ${
        !canPay ? styles.payButtonDisabled : ''
      }`}
      disabled={!canPay}
      onClick={handlePay}
    >
      총 {totalDue.toLocaleString()}원 결제하기
    </button>
  );
}

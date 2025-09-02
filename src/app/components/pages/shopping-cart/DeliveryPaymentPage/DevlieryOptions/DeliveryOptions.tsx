import { useState, useMemo } from 'react';
import styles from '../DeliveryPayment.module.css';
import { FaChevronDown } from 'react-icons/fa';

interface DeliveryOptionsProps {
  deliveryOption: 'delivery' | 'pickup' | null;
  setDeliveryOption: (value: 'delivery' | 'pickup') => void;
}

export default function DeliveryOptions({
  deliveryOption,
  setDeliveryOption,
}: DeliveryOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = useMemo(
    () => [
      { value: 'delivery' as const, label: '배송' },
      { value: 'pickup' as const, label: '픽업' },
    ],
    []
  );

  const handleSelect = (value: 'delivery' | 'pickup') => {
    setDeliveryOption(value);
    setIsOpen(false);
  };

  const toggleLabel =
    deliveryOption !== null
      ? options.find((o) => o.value === deliveryOption)?.label
      : '배송 옵션 선택';

  return (
    <section className={styles.dropdownContainer}>
      <div
        className={`${styles.dropdownToggle} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.dropdownLabel}>{toggleLabel}</span>
        <FaChevronDown
          className={styles.dropdownArrow}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: '0.2s',
          }}
        />
      </div>

      {isOpen && (
        <ul className={styles.dropdownMenu}>
          {options.map((option) => (
            <li
              key={option.value}
              className={styles.dropdownItem}
              onClick={() => handleSelect(option.value)}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  color: '#000',
                }}
              >
                <input
                  type="checkbox"
                  checked={deliveryOption === option.value}
                  readOnly
                  className={styles.checkbox}
                />
                {option.label}
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

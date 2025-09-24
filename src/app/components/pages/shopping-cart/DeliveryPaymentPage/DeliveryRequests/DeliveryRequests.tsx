import { useState, useMemo } from 'react';
import styles from '../DeliveryPayment.module.css';
import { FaChevronDown } from 'react-icons/fa';

interface DeliveryRequestsProps {
  requestNote: string;
  setRequestNote: (value: string) => void;
  customRequest: string;
  setCustomRequest: (value: string) => void;
}

export default function DeliveryRequests({
  requestNote,
  setRequestNote,
  customRequest,
  setCustomRequest,
}: DeliveryRequestsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options = useMemo(
    () => [
      { value: 'guard', label: '부재시 경비실에 맡겨주세요.' },
      { value: 'front', label: '집앞에 놔주세요.' },
      { value: 'locker', label: '택배함에 놔주세요.' },
      { value: 'call', label: '배송 전에 꼭 연락주세요.' },
      { value: 'custom', label: '직접 입력' },
    ],
    []
  );

  const handleSelect = (value: string) => {
    setRequestNote(value);
    setIsOpen(false);
  };

  // Get label of selected option, or fallback to placeholder
  const selectedLabel =
    requestNote !== ''
      ? options.find((o) => o.value === requestNote)?.label
      : '배송 시 요청사항을 선택해주세요';

  return (
    <section className={styles.card}>
      {/* Dropdown toggle */}
      <div
        className={`${styles.dropdownToggle} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={styles.dropdownPlaceholder}
          style={{ color: '#888', fontSize: '0.875rem' }}
        >
          {selectedLabel}
        </span>
        <FaChevronDown
          className={styles.dropdownArrow}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: '0.2s',
          }}
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <ul className={styles.dropdownMenu}>
          {options.map((option) => (
            <li
              key={option.value}
              className={styles.dropdownItem}
              onClick={() => handleSelect(option.value)}
              style={{
                color:
                  requestNote === option.value ? '#000000' : 'rgba(0,0,0,0.4)',
                fontSize: '0.875rem',
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {/* Custom input when "직접 입력" selected */}
      {requestNote === 'custom' && (
        <div>
          <textarea
            className={styles.directInput}
            placeholder="요청사항을 입력해주세요"
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
          />
        </div>
      )}
    </section>
  );
}

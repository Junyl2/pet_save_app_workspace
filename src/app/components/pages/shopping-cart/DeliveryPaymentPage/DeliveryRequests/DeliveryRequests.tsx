import { useState } from 'react';
import styles from '../DeliveryPayment.module.css';

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
  return (
    <section className={styles.card}>
      <label className={styles.sectionTitle} htmlFor="requests">
        배송 시 요청사항을 선택해주세요
      </label>
      <select
        id="requests"
        className={styles.select}
        value={requestNote}
        onChange={(e) => setRequestNote(e.target.value)}
      >
        <option value="">배송 시 요청사항을 선택해주세요.</option>
        <option value="guard">부재시 경비실에 맡겨주세요.</option>
        <option value="front">집앞에 놔주세요.</option>
        <option value="locker">택배함에 놔주세요.</option>
        <option value="call">배송 전에 꼭 연락주세요.</option>
        <option value="custom">직접 입력</option>
      </select>
      {requestNote === 'custom' && (
        <input
          className={styles.input}
          placeholder="요청사항을 입력해주세요"
          value={customRequest}
          onChange={(e) => setCustomRequest(e.target.value)}
        />
      )}
    </section>
  );
}

"use client";
import { useState } from "react";
import { Product } from "@/app/components/types/order";

import { ProductSelectionStep } from "./ProductSelectionStep";
import { ExchangeReasonStep } from "./ExchangeReasonStep";
import { ExchangeDetailStep } from "./ExchangeDetailStep";
import { CollectionInfoStep } from "./CollectionInfoStep";
import { SubmitButtonStep } from "./SubmitButtonStep";
import styles from "./ExchangeForm.module.css";

interface ExchangeFormProps {
  product: Product;
  onSubmit: (data: ExchangeFormData) => void;
  onBack: () => void;
}

export interface ExchangeFormData {
  selectedReason: string;
  selectedDetail: string;
  productSelected: boolean;
}

export function ExchangeForm({ product, onSubmit }: ExchangeFormProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedDetail, setSelectedDetail] = useState("");
  const [productSelected, setProductSelected] = useState(true);

  const exchangeReasons = ["불량", "오배송", "단순변심"];
  const exchangeDetails = ["교환 사유를 선택해 주세요"];

  const handleSubmit = () => {
    onSubmit({
      selectedReason,
      selectedDetail,
      productSelected,
    });
  };

  const isSubmitDisabled = !productSelected || !selectedReason;

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>교환품 선택해 주세요</h1>
        <ProductSelectionStep
          product={product}
          isSelected={productSelected}
          onSelectionChange={setProductSelected}
        />

        <div className={styles.section}>
          <ExchangeReasonStep
            selectedReason={selectedReason}
            onReasonChange={setSelectedReason}
            reasons={exchangeReasons}
          />
        </div>
      </div>

      <div className={styles.section}>
        <ExchangeDetailStep
          selectedDetail={selectedDetail}
          onDetailChange={setSelectedDetail}
          details={exchangeDetails}
        />
      </div>

      <div className={styles.section}>
        <CollectionInfoStep product={product} />
      </div>

      <SubmitButtonStep onSubmit={handleSubmit} disabled={isSubmitDisabled} />
    </div>
  );
}

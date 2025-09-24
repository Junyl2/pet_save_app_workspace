"use client";

import { useState } from "react";
import type { RefundData, Product } from "@/app/components/types/refund";

export function useRefundState(initialProduct?: Product) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [refundData, setRefundData] = useState<RefundData>({
    selectedItems: initialProduct ? [initialProduct.id] : [],
    selectedReason: "",
    returnMethod: "pickup",
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const updateRefundData = (updates: Partial<RefundData>) => {
    setRefundData((prev) => ({ ...prev, ...updates }));
  };

  return {
    currentStep,
    isCompleted,
    refundData,
    handleNext,
    updateRefundData,
  };
}

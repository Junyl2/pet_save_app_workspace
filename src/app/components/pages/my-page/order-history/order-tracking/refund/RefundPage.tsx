"use client";
import React, { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Steps from "@/app/components/ui/steps/Steps";
import { useRefundState } from "@/app/components/hooks/use-refund-state";
import { useProductSelection } from "@/app/components/hooks/use-product-selection";
import {
  createProductFromParams,
  getMockProducts,
} from "@/app/utils/product-utils";
import { isStepValid } from "@/app/utils/validation";
import { REFUND_STEPS } from "@/app/components/constants/refund";
import { ProductSelectionStep } from "./refund-steps/product-selection-step";
import { ReasonSelectionStep } from "./refund-steps/reason-selection-step";
import { ReturnMethodStep } from "./refund-steps/return-method-step";
import { RefundConfirmationStep } from "./refund-steps/refund-confirmation-step";
import { CompletionScreen } from "./refund-steps/completion-screen";
import styles from "./RefundPage.module.css";

export default function RefundPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.orderId as string;

  const passedProduct = useMemo(() => {
    const product = createProductFromParams(searchParams);
    return product ?? undefined; // Convert null to undefined
  }, [searchParams]);

  const MOCK_PRODUCTS = getMockProducts(passedProduct);

  const { currentStep, isCompleted, refundData, handleNext, updateRefundData } =
    useRefundState(passedProduct);

  const { handleProductSelect, handleSelectAll } = useProductSelection(
    MOCK_PRODUCTS,
    refundData.selectedItems,
    updateRefundData
  );

  const [isDeliveryOrder] = React.useState(false);

  const isNextDisabled = () => !isStepValid(currentStep, refundData);

  const handleReasonChange = (
    reason: string,
    sub?: string,
    detail?: string
  ) => {
    updateRefundData({
      selectedReason: reason,
      subReason: sub,
      detailReason: detail,
    });
  };

  const handleMethodChange = (method: string) => {
    updateRefundData({ returnMethod: method });
  };

  if (isCompleted) {
    return (
      <CompletionScreen isDeliveryOrder={isDeliveryOrder} orderId={orderId} />
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.section} ${styles["section--steps"]}`}>
        <Steps
          steps={[...REFUND_STEPS]} // ✅ Fix: Make mutable copy
          currentStepIndex={currentStep}
          numbered={true}
        />
      </div>

      {currentStep === 0 && (
        <ProductSelectionStep
          products={MOCK_PRODUCTS}
          selectedItems={refundData.selectedItems}
          onProductSelect={handleProductSelect}
          onSelectAll={handleSelectAll}
        />
      )}

      {currentStep === 1 && (
        <ReasonSelectionStep
          products={MOCK_PRODUCTS} // 👈 pass the full product list
          selectedItems={refundData.selectedItems} // 👈 pass selected items
          selectedReason={refundData.selectedReason}
          subReason={refundData.subReason}
          detailReason={refundData.detailReason}
          onReasonChange={handleReasonChange}
        />
      )}

      {currentStep === 2 && (
        <ReturnMethodStep
          isDeliveryOrder={isDeliveryOrder}
          returnMethod={refundData.returnMethod}
          onMethodChange={handleMethodChange}
        />
      )}

      {currentStep === 3 && (
        <RefundConfirmationStep
          selectedProducts={MOCK_PRODUCTS.filter((p) =>
            refundData.selectedItems.includes(p.id)
          )}
          isDeliveryOrder={isDeliveryOrder}
        />
      )}

      <div className={styles.buttonContainer}>
        <button
          className={styles.nextButton}
          onClick={handleNext}
          disabled={isNextDisabled()}
        >
          {currentStep === REFUND_STEPS.length - 1 ? "반품신청" : "다음"}
        </button>
      </div>
    </div>
  );
}
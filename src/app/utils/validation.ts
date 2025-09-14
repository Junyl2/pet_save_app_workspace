import type { RefundData } from "@/app/components/types/refund";

export function isStepValid(step: number, refundData: RefundData): boolean {
  switch (step) {
    case 0:
      return refundData.selectedItems.length > 0;
    case 1:
      return !!refundData.selectedReason;
    case 2:
      return !!refundData.returnMethod;
    default:
      return true;
  }
}

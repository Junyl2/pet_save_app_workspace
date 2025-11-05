import { apiClient } from '@/app/api/apiClient';
import {
  AddPaymentRequest,
  AddPaymentResponse,
  PreparePaymentResponse,
  ProcessPaymentResponse,
  ConfirmPaymentResponse,
} from '@/app/api/types/admin/payment/payment';

export const paymentService = {
  /**
   * Add payment to order (For bank transfer or real-time transfer ONLY)
   * POST /api/pet-save/payments/order/{orderId}/create
   *
   * Purpose:
   * - Adds a new payment record for an existing order
   * - Typically used for manual bank transfers or partial payments
   */
  addPaymentToOrder: async (
    orderId: string,
    request: AddPaymentRequest
  ): Promise<{ data: AddPaymentResponse | null; error?: string }> => {
    return await apiClient.post<AddPaymentResponse>(
      `/payments/order/${orderId}/create`,
      request
    );
  },

  /**
   * Set payment amount (Manual transfer setup)
   * POST /api/pet-save/payments/{paymentId}/prepare?amount={amount}
   *
   * Purpose:
   * - Used to manually set or adjust the amount to be paid
   * - Only applicable for manual or bank transfers
   */
  preparePaymentAmount: async (
    paymentId: string,
    amount: number
  ): Promise<{ data: PreparePaymentResponse | null; error?: string }> => {
    return await apiClient.post<PreparePaymentResponse>(
      `/payments/${paymentId}/prepare?amount=${amount}`
    );
  },

  /**
   * Process or confirm payment for an order
   * POST /api/pet-save/payments/orders/{paymentId}/process
   *
   * Purpose:
   * - Marks a payment as successful or completed
   * - Automatically issues an invoice if order is fully paid
   */
  processPayment: async (
    paymentId: string
  ): Promise<{ data: ProcessPaymentResponse | null; error?: string }> => {
    return await apiClient.post<ProcessPaymentResponse>(
      `/payments/orders/${paymentId}/process`
    );
  },

  /**
   * Confirm payment automatically (Full manual payment)
   * POST /api/pet-save/payments/orders/{orderId}/confirm
   *
   * Purpose:
   * - Automatically sets existing payment as full
   * - Used for one-step manual payment confirmation
   * - Shortcut for /prepare -> /process
   */
  confirmFullPayment: async (
    orderId: string
  ): Promise<{ data: ConfirmPaymentResponse | null; error?: string }> => {
    return await apiClient.post<ConfirmPaymentResponse>(
      `/payments/orders/${orderId}/confirm`
    );
  },
};

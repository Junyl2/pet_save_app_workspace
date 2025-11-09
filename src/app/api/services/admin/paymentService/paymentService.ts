import { apiClient } from '@/app/api/apiClient';
import {
  AddPaymentRequest,
  AddPaymentResponse,
  PreparePaymentResponse,
  ProcessPaymentResponse,
  ConfirmPaymentResponse,
  PaymentSuccessResponse,
  PaymentFailResponse,
} from '@/app/api/types/admin/payment/payment';

export const paymentService = {
  /**
   * Add payment to order (For bank transfer or real-time transfer ONLY)
   * POST /api/pet-save/payments/order/{orderId}/create
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
   */
  confirmFullPayment: async (
    orderId: string
  ): Promise<{ data: ConfirmPaymentResponse | null; error?: string }> => {
    return await apiClient.post<ConfirmPaymentResponse>(
      `/payments/orders/${orderId}/confirm`
    );
  },

  /**
   * Handle payment success (Success redirect URL for TossPayments)
   * GET /api/pet-save/payments/success?paymentKey={key}&orderId={id}&amount={amount}
   */
  handlePaymentSuccess: async (
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<{ data: PaymentSuccessResponse | null; error?: string }> => {
    return await apiClient.get<PaymentSuccessResponse>(
      `/payments/success?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`
    );
  },

  /**
   * Handle payment failure (Fail redirect URL for TossPayments)
   * GET /api/pet-save/payments/fail?code={code}&message={message}&orderId={id}
   */
  handlePaymentFail: async (
    code: string,
    message: string,
    orderId: string
  ): Promise<{ data: PaymentFailResponse | null; error?: string }> => {
    return await apiClient.get<PaymentFailResponse>(
      `/payments/fail?code=${code}&message=${message}&orderId=${orderId}`
    );
  },
};

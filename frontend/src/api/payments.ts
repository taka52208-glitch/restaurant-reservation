import { apiClient } from './client';

interface PaymentIntentRequest {
  reservation_id: string;
  amount: number;
  currency?: string;
}

interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RefundRequest {
  payment_intent_id: string;
  reason?: string;
}

interface RefundResponse {
  refund_id: string;
  payment_intent_id: string;
  amount: number;
  status: string;
  message: string;
}

export const paymentsApi = {
  createIntent: async (request: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
    const { data } = await apiClient.post<PaymentIntentResponse>('/payments/create-intent', request);
    return data;
  },

  refund: async (request: RefundRequest): Promise<RefundResponse> => {
    const { data } = await apiClient.post<RefundResponse>('/payments/refund', request);
    return data;
  },
};

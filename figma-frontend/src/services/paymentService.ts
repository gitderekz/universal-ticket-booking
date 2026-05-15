import apiClient from './apiClient';

export interface Payment {
  id: string;
  booking_id: string;
  transaction_reference: string;
  method: string;
  provider: string;
  amount: number;
  currency_id?: string;
  response_json: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paid_at?: string;
}

export const paymentService = {
  processPayment: async (paymentData: {
    booking_id: string;
    method: string;
    provider: string;
    amount: number;
    phone_number?: string;
  }) => {
    const response = await apiClient.post<{ payment: Payment; booking: any }>('/payments/process', paymentData);
    return response.data;
  },

  getPayment: async (bookingId: string) => {
    const response = await apiClient.get<Payment>(`/payments/booking/${bookingId}`);
    return response.data;
  },

  verifyPayment: async (transactionReference: string) => {
    const response = await apiClient.get<Payment>(`/payments/verify/${transactionReference}`);
    return response.data;
  },
};

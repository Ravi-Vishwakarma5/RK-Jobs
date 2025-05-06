export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  duration: number; // in days
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentId: string;
}

export interface PaymentDetails {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  transactionId?: string;
}

export interface PaymentRequest {
  planId: string;
  userId: string;
  email: string;
  name: string;
  paymentMethod: string;
  cardDetails?: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  };
}

import { SubscriptionPlan, UserSubscription, PaymentDetails } from '@/types/subscription';

// Available subscription plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for job seekers just starting out',
    price: 499,
    currency: 'INR',
    features: [
      'Unlimited job applications',
      'Basic profile visibility',
      'Email notifications for new jobs',
      'Access to job search filters'
    ],
    duration: 365, // 1 year in days
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For serious job seekers looking to stand out',
    price: 599,
    currency: 'INR',
    features: [
      'Unlimited job applications',
      'Referrals from industry professionals',
      'Featured profile for employers',
      'Priority application processing',
      'Advanced job search filters',
    ],
    duration: 365,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'The ultimate job seeking experience',
    price: 699,
    currency: 'INR',
    features: [
      'All Professional features',
      'Resume & CV review by experts',
      'Direct messaging with employers',
      'Interview preparation resources',
      'Personalized job recommendations',
      'Early access to new job listings'
    ],
    duration: 365,
  }
];

// Mock user subscriptions (would be stored in a database)
export const userSubscriptions: UserSubscription[] = [];

// Mock payment records (would be stored in a database)
export const paymentRecords: PaymentDetails[] = [];

// Function to add a new subscription
export function addSubscription(subscription: Omit<UserSubscription, 'id'>): UserSubscription {
  const newSubscription: UserSubscription = {
    ...subscription,
    id: Math.random().toString(36).substring(2, 15),
  };

  userSubscriptions.push(newSubscription);
  return newSubscription;
}

// Function to add a new payment record
export function addPaymentRecord(payment: Omit<PaymentDetails, 'id'>): PaymentDetails {
  const newPayment: PaymentDetails = {
    ...payment,
    id: Math.random().toString(36).substring(2, 15),
  };

  paymentRecords.push(newPayment);
  return newPayment;
}

// Function to get a subscription plan by ID
export function getSubscriptionPlanById(planId: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find(plan => plan.id === planId);
}

// Function to get a user's active subscription
export function getUserActiveSubscription(userId: string): UserSubscription | undefined {
  // First check in-memory subscriptions
  const dbSubscription = userSubscriptions.find(
    sub => sub.userId === userId && sub.status === 'active'
  );

  if (dbSubscription) {
    return dbSubscription;
  }

  // If no in-memory subscription found, check localStorage
  // This is for demo purposes only - in a real app, this would be a server-side check
  if (typeof window !== 'undefined') {
    const hasActiveSubscription = localStorage.getItem('hasActiveSubscription');

    if (hasActiveSubscription === 'true') {
      // Create a mock subscription for demo purposes
      const mockSubscription: UserSubscription = {
        id: 'mock-subscription',
        userId: userId,
        planId: 'premium',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        paymentId: 'mock-payment'
      };

      return mockSubscription;
    }
  }

  return undefined;
}

// Function to check if a user has an active subscription
export function hasActiveSubscription(userId: string): boolean {
  // First check in-memory subscriptions
  const hasDbSubscription = userSubscriptions.some(
    sub => sub.userId === userId && sub.status === 'active'
  );

  if (hasDbSubscription) {
    return true;
  }

  // If no in-memory subscription found, check localStorage
  // This is for demo purposes only - in a real app, this would be a server-side check
  if (typeof window !== 'undefined') {
    const hasActiveSubscription = localStorage.getItem('hasActiveSubscription');
    return hasActiveSubscription === 'true';
  }

  return false;
}

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
      'Apply to up to 10 jobs per month',
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
    price: 999,
    currency: 'INR',
    features: [
      'Unlimited job applications',
      'Featured profile for employers',
      'Priority application processing',
      'Advanced job search filters',
      'Resume review by experts'
    ],
    duration: 365,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'The ultimate job seeking experience',
    price: 1499,
    currency: 'INR',
    features: [
      'All Professional features',
      'Career coaching sessions',
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
  return userSubscriptions.find(
    sub => sub.userId === userId && sub.status === 'active'
  );
}

// Function to check if a user has an active subscription
export function hasActiveSubscription(userId: string): boolean {
  return userSubscriptions.some(
    sub => sub.userId === userId && sub.status === 'active'
  );
}

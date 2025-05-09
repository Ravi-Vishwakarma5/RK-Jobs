import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the structure for the subscription document
export interface Subscription extends Document {
  userId: string;
  email: string;
  fullName: string;
  plan: string;
  amount: number;
  currency: string;
  paymentId: string;
  paymentMethod: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  features: string[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionDetails?: Record<string, any>;
}

// Define the subscription schema
const subscriptionSchema = new Schema<Subscription>(
  {
    userId: { 
      type: String, 
      required: true,
      index: true // Add index for faster queries
    },
    email: { 
      type: String, 
      required: true,
      index: true // Add index for faster queries
    },
    fullName: { 
      type: String, 
      required: true 
    },
    plan: { 
      type: String, 
      required: true,
      default: 'standard' // Only one plan as per requirements
    },
    amount: { 
      type: Number, 
      required: true,
      default: 699 // 699 INR as per requirements
    },
    currency: { 
      type: String, 
      required: true,
      default: 'INR'
    },
    paymentId: { 
      type: String, 
      required: true,
      index: true // Add index for faster queries
    },
    paymentMethod: { 
      type: String, 
      required: true,
      default: 'razorpay'
    },
    status: { 
      type: String, 
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'pending',
      index: true // Add index for faster queries
    },
    features: { 
      type: [String], 
      default: ['unlimited_jobs', 'referrals', 'interview_review', 'cv_review']
    },
    startDate: { 
      type: Date, 
      default: Date.now 
    },
    endDate: { 
      type: Date, 
      required: true
    },
    razorpayOrderId: { 
      type: String, 
      required: false 
    },
    razorpayPaymentId: { 
      type: String, 
      required: false 
    },
    razorpaySignature: { 
      type: String, 
      required: false 
    },
    transactionDetails: { 
      type: Schema.Types.Mixed, 
      required: false 
    }
  },
  {
    timestamps: true,  // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// Add method to check if subscription is active
subscriptionSchema.methods.isActive = function(): boolean {
  return this.status === 'active' && this.endDate > new Date();
};

// Add method to calculate days remaining
subscriptionSchema.methods.daysRemaining = function(): number {
  if (this.status !== 'active') return 0;
  
  const now = new Date();
  const end = new Date(this.endDate);
  
  if (end <= now) return 0;
  
  const diffTime = Math.abs(end.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Fix for Next.js hot reloading issue with Mongoose models
// This prevents "Cannot overwrite model once compiled" errors
let SubscriptionModel: Model<Subscription>;

try {
  // Try to get the existing model
  SubscriptionModel = mongoose.model<Subscription>('Subscription');
  console.log('Using existing Subscription model');
} catch (error) {
  // If the model doesn't exist, create a new one
  SubscriptionModel = mongoose.model<Subscription>('Subscription', subscriptionSchema);
  console.log('Created new Subscription model');
}

export default SubscriptionModel;

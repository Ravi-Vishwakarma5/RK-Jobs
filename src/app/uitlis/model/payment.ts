import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the structure for the payment document
export interface Payment extends Document {
  userId: string;
  email: string;
  fullName: string;
  amount: number;
  currency: string;
  paymentId: string;
  orderId: string;
  paymentMethod: string;
  status: 'success' | 'failed' | 'pending';
  subscriptionId: string;
  paymentDate: Date;
  signature?: string;
  transactionDetails?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Define the payment schema
const paymentSchema = new Schema<Payment>(
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
    amount: { 
      type: Number, 
      required: true
    },
    currency: { 
      type: String, 
      required: true,
      default: 'INR'
    },
    paymentId: { 
      type: String, 
      required: true,
      unique: true,
      index: true // Add index for faster queries
    },
    orderId: { 
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
      enum: ['success', 'failed', 'pending'],
      default: 'pending',
      index: true // Add index for faster queries
    },
    subscriptionId: { 
      type: String, 
      required: true,
      index: true // Add index for faster queries
    },
    paymentDate: { 
      type: Date, 
      default: Date.now 
    },
    signature: { 
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

// Fix for Next.js hot reloading issue with Mongoose models
// This prevents "Cannot overwrite model once compiled" errors
let PaymentModel: Model<Payment>;

try {
  // Try to get the existing model
  PaymentModel = mongoose.model<Payment>('Payment');
  console.log('Using existing Payment model');
} catch (error) {
  // If the model doesn't exist, create a new one
  PaymentModel = mongoose.model<Payment>('Payment', paymentSchema);
  console.log('Created new Payment model');
}

export default PaymentModel;

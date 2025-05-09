import mongoose, { Schema, Document, Model } from 'mongoose';

// Define a simplified payment schema with only essential fields
export interface SimplePayment extends Document {
  name: string;
  email: string;
  paymentId: string;
  amount: number;
  date: Date;
  status: string;
}

// Create the schema
const simplePaymentSchema = new Schema<SimplePayment>(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    paymentId: { 
      type: String, 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      default: 'success' 
    }
  },
  {
    timestamps: true,  // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// Fix for Next.js hot reloading issue with Mongoose models
let SimplePaymentModel: Model<SimplePayment>;

try {
  // Try to get the existing model
  SimplePaymentModel = mongoose.model<SimplePayment>('SimplePayment');
  console.log('Using existing SimplePayment model');
} catch (error) {
  // If the model doesn't exist, create a new one
  SimplePaymentModel = mongoose.model<SimplePayment>('SimplePayment', simplePaymentSchema);
  console.log('Created new SimplePayment model');
}

export default SimplePaymentModel;

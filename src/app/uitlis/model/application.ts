import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the structure for the application document
export interface Application extends Document {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  resume: string; // This would be a file path or URL in a real application
  coverLetter?: string;
  appliedDate: Date;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'accepted';
  userId?: string; // For future authentication
}

// Define the application schema
const applicationSchema = new Schema<Application>(
  {
    jobId: { 
      type: String, 
      required: true,
      index: true // Add index for faster queries
    },
    fullName: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true,
      index: true // Add index for faster queries
    },
    phone: { 
      type: String, 
      required: true 
    },
    resume: { 
      type: String, 
      required: true 
    },
    coverLetter: { 
      type: String, 
      required: false 
    },
    appliedDate: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ['pending', 'reviewed', 'interview', 'rejected', 'accepted'],
      default: 'pending'
    },
    userId: { 
      type: String, 
      required: false,
      index: true // Add index for faster queries
    }
  },
  {
    timestamps: true,  // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// Fix for Next.js hot reloading issue with Mongoose models
// This prevents "Cannot overwrite model once compiled" errors
let ApplicationModel: Model<Application>;

try {
  // Try to get the existing model
  ApplicationModel = mongoose.model<Application>('Application');
  console.log('Using existing Application model');
} catch (error) {
  // If the model doesn't exist, create a new one
  ApplicationModel = mongoose.model<Application>('Application', applicationSchema);
  console.log('Created new Application model');
}

export default ApplicationModel;

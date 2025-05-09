import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

// Define the structure for the user document
export interface User extends Document {
  email: string;
  fullName: string;
  passwordHash: string;
  passwordSalt: string;
  role: 'user' | 'admin';
  isActive: boolean;
  hasActiveSubscription: boolean;
  subscriptionId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  verifyPassword: (password: string) => boolean;
  setPassword: (password: string) => void;
}

// Define the user schema
const userSchema = new Schema<User>(
  {
    email: { 
      type: String, 
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true // Add index for faster queries
    },
    fullName: { 
      type: String, 
      required: true 
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    passwordSalt: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'],
      default: 'user'
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    hasActiveSubscription: { 
      type: Boolean, 
      default: false,
      index: true // Add index for faster queries
    },
    subscriptionId: { 
      type: String, 
      required: false,
      index: true // Add index for faster queries
    },
    lastLogin: { 
      type: Date, 
      required: false 
    }
  },
  {
    timestamps: true,  // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// Method to verify password
userSchema.methods.verifyPassword = function(password: string): boolean {
  const hash = crypto.pbkdf2Sync(
    password,
    this.passwordSalt,
    1000,
    64,
    'sha512'
  ).toString('hex');
  
  return this.passwordHash === hash;
};

// Method to set password
userSchema.methods.setPassword = function(password: string): void {
  this.passwordSalt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto.pbkdf2Sync(
    password,
    this.passwordSalt,
    1000,
    64,
    'sha512'
  ).toString('hex');
};

// Fix for Next.js hot reloading issue with Mongoose models
// This prevents "Cannot overwrite model once compiled" errors
let UserModel: Model<User>;

try {
  // Try to get the existing model
  UserModel = mongoose.model<User>('User');
  console.log('Using existing User model');
} catch (error) {
  // If the model doesn't exist, create a new one
  UserModel = mongoose.model<User>('User', userSchema);
  console.log('Created new User model');
}

export default UserModel;

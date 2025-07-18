import mongoose, { Document, Schema, model, models } from 'mongoose';

export interface IFreeUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
}

const FreeUserSchema: Schema = new Schema<IFreeUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite error in development
const FreeUser = models.freeuser || model<IFreeUser>('freeuser', FreeUserSchema);

export default FreeUser;

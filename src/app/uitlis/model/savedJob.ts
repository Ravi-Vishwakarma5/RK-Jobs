import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for SavedJob document
export interface ISavedJob extends Document {
  jobId: string;
  title: string;
  company: string;
  location: string;
  userId: string;
  email: string;
  createdAt: Date;
}

// Schema for SavedJob
const SavedJobSchema: Schema = new Schema({
  jobId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index to prevent duplicate saved jobs for the same user
SavedJobSchema.index({ jobId: 1, email: 1 }, { unique: true });

// Create or get the SavedJob model
const SavedJobModel: Model<ISavedJob> = 
  mongoose.models.SavedJob || mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);

export default SavedJobModel;

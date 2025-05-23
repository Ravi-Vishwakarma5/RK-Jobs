import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the structure for the job document
interface Job extends Document {
  title: string;
  company: string;
  location: string;
  jobType: string;
  category: string;
  salary: string;
  logo?: string;
  description: string[];
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the job schema
const jobSchema = new Schema<Job>(
  {
    title: { type: String, required: true },                // Job title (e.g., "Senior Frontend Developer")
    company: { type: String, required: true },              // Company name (e.g., "TechCorp")
    location: { type: String, required: true },             // Job location (e.g., "San Francisco, CA")
    jobType: { type: String, required: true },              // Job type (e.g., "Full-time", "Part-Remote")
    category: { type: String, required: true },             // Job category (e.g., "Technology", "Finance")
    salary: { type: String, required: true },               // Salary range (e.g., "$120,000 - $150,000")
    logo: { type: String, required: false, default: '' },   // Optional logo URL for the company
    description: { type: [String], required: true },        // Array of descriptions
    requirements: { type: [String], required: true },       // Array of job requirements
    responsibilities: { type: [String], required: true },   // Array of job responsibilities
    benefits: { type: [String], required: true },           // Array of job benefits
  },
  {
    timestamps: true,  // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// Fix for Next.js hot reloading issue with Mongoose models
// This prevents "Cannot overwrite model once compiled" errors
let JobModel: Model<Job>;

try {
  // Try to get the existing model
  JobModel = mongoose.model<Job>('Job');
  console.log('Using existing Job model');
} catch (error) {
  // If the model doesn't exist, create a new one
  JobModel = mongoose.model<Job>('Job', jobSchema);
  console.log('Created new Job model');
}

export default JobModel;

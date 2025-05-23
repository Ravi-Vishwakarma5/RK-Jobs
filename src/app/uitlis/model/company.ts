import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the structure for the company document
interface Company extends Document {
  name: string;
  description: string;
  logo: string;
  website: string;
  industry: string;
  location: string;
  size: string;
  founded: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the company schema
const companySchema = new Schema<Company>(
  {
    name: { type: String, required: true },                // Company name
    description: { type: String, required: true },         // Company description
    logo: { type: String, required: false, default: '' },  // Logo URL (Cloudinary)
    website: { type: String, required: false },            // Company website
    industry: { type: String, required: true },            // Industry (e.g., "Technology", "Finance")
    location: { type: String, required: true },            // Company location
    size: { type: String, required: false },               // Company size (e.g., "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+")
    founded: { type: Number, required: false },            // Year founded
  },
  {
    timestamps: true,  // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// Fix for Next.js hot reloading issue with Mongoose models
// This prevents "Cannot overwrite model once compiled" errors
let CompanyModel: Model<Company>;

try {
  // Try to get the existing model
  CompanyModel = mongoose.model<Company>('Company');
  console.log('Using existing Company model');
} catch (error) {
  // If the model doesn't exist, create a new one
  CompanyModel = mongoose.model<Company>('Company', companySchema);
  console.log('Created new Company model');
}

export default CompanyModel;

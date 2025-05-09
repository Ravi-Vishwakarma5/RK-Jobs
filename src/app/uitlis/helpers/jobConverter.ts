/**
 * Utility functions to convert between different job formats
 */

// Convert a MongoDB job document to the format expected by the frontend
export function convertMongoJobToFrontend(mongoJob: any) {
  if (!mongoJob) return null;
  
  // Handle both plain objects and Mongoose documents
  const job = mongoJob.toObject ? mongoJob.toObject() : { ...mongoJob };
  
  return {
    id: job._id ? job._id.toString() : job.id || '',
    title: job.title || '',
    company: job.company || '',
    location: job.location || '',
    type: job.jobType || '',
    salary: job.salary || '',
    logo: job.logo || '',
    description: Array.isArray(job.description) 
      ? job.description.join(' ') 
      : String(job.description || ''),
    postedDate: job.createdAt 
      ? new Date(job.createdAt).toLocaleDateString() 
      : new Date().toLocaleDateString(),
    tags: [], // Add tags if available in your data model
    // Add additional fields that might be needed by the frontend
    requirements: job.requirements || [],
    responsibilities: job.responsibilities || [],
    benefits: job.benefits || [],
  };
}

// Check if a string is a valid MongoDB ObjectId
export function isValidObjectId(id: string): boolean {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
}

// Convert a frontend job to the format expected by MongoDB
export function convertFrontendJobToMongo(frontendJob: any) {
  return {
    title: frontendJob.title,
    company: frontendJob.company,
    location: frontendJob.location,
    jobType: frontendJob.type || frontendJob.jobType,
    salary: frontendJob.salary,
    logo: frontendJob.logo || '',
    description: Array.isArray(frontendJob.description) 
      ? frontendJob.description 
      : [frontendJob.description],
    requirements: frontendJob.requirements || [],
    responsibilities: frontendJob.responsibilities || [],
    benefits: frontendJob.benefits || [],
  };
}

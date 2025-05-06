export interface JobApplication {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  resume: string; // This would be a file path or URL in a real application
  coverLetter?: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'accepted';
}

// This is a mock database for job applications
// In a real application, this would be stored in a database
export const jobApplications: JobApplication[] = [];

// Function to add a new application
export function addApplication(application: Omit<JobApplication, 'id' | 'appliedDate' | 'status'>): JobApplication {
  const newApplication: JobApplication = {
    ...application,
    id: Math.random().toString(36).substring(2, 15),
    appliedDate: new Date().toISOString(),
    status: 'pending'
  };

  jobApplications.push(newApplication);
  return newApplication;
}

// Function to get applications by job ID
export function getApplicationsByJobId(jobId: string): JobApplication[] {
  return jobApplications.filter(app => app.jobId === jobId);
}

// Function to get application by ID
export function getApplicationById(id: string): JobApplication | undefined {
  return jobApplications.find(app => app.id === id);
}

// Function to update application status
export function updateApplicationStatus(id: string, status: JobApplication['status']): JobApplication | undefined {
  const application = jobApplications.find(app => app.id === id);
  if (application) {
    application.status = status;
    return application;
  }
  return undefined;
}

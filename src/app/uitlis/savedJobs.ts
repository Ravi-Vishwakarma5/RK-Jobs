import { getAuthToken } from './auth';

export interface SavedJob {
  _id?: string;
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
}

/**
 * Fetch saved jobs for the current user
 * @returns Array of saved jobs
 */
export async function fetchSavedJobs(): Promise<SavedJob[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch('/api/user/saved-jobs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch saved jobs');
    }
    
    const data = await response.json();
    return data.savedJobs.map((job: any) => ({
      id: job.jobId,
      title: job.title,
      company: job.company,
      location: job.location,
      date: job.date
    }));
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return [];
  }
}

/**
 * Save a job for the current user
 * @param job The job to save
 * @returns True if the job was saved successfully
 */
export async function saveJob(job: SavedJob): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch('/api/user/saved-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save job');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving job:', error);
    return false;
  }
}

/**
 * Remove a saved job for the current user
 * @param jobId The ID of the job to remove
 * @returns True if the job was removed successfully
 */
export async function removeSavedJob(jobId: string): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove saved job');
    }
    
    return true;
  } catch (error) {
    console.error('Error removing saved job:', error);
    return false;
  }
}

/**
 * Check if a job is saved by the current user
 * @param jobId The ID of the job to check
 * @param savedJobs Array of saved jobs
 * @returns True if the job is saved
 */
export function isJobSaved(jobId: string, savedJobs: SavedJob[]): boolean {
  return savedJobs.some(job => job.id === jobId);
}

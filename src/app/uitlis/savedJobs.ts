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
      console.error('No authentication token found');
      throw new Error('Not authenticated');
    }

    console.log('Fetching saved jobs from API...');
    const response = await fetch('/api/user/saved-jobs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Saved jobs API response status:', response.status);

    if (!response.ok) {
      console.error(`Failed to fetch saved jobs: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch saved jobs: ${response.status}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', contentType);
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();
    console.log('Saved jobs data received:', data);

    if (!data.success || !data.savedJobs || !Array.isArray(data.savedJobs)) {
      console.error('Invalid saved jobs data format:', data);
      return [];
    }

    return data.savedJobs.map((job: any) => ({
      id: job.jobId,
      title: job.title,
      company: job.company,
      location: job.location,
      date: job.date
    }));
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
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
    console.log(`Saving job with ID: ${job.id}`);

    const token = getAuthToken();
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Not authenticated');
    }

    console.log('Making POST request to /api/user/saved-jobs');
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

    console.log('POST response status:', response.status);

    if (!response.ok) {
      console.error(`Failed to save job: ${response.status} ${response.statusText}`);

      // Try to get error details from response
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error(`Failed to save job: ${errorData.error || response.statusText}`);
      } catch (parseError) {
        throw new Error(`Failed to save job: ${response.status}`);
      }
    }

    try {
      const data = await response.json();
      console.log('Save job response:', data);
      return data.success === true;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      // If we can't parse the response but the status was OK, assume success
      return true;
    }
  } catch (error) {
    console.error('Error saving job:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
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
    console.log(`Removing saved job with ID: ${jobId}`);

    const token = getAuthToken();
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Not authenticated');
    }

    console.log('Making DELETE request to /api/user/saved-jobs');
    const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('DELETE response status:', response.status);

    if (!response.ok) {
      console.error(`Failed to remove saved job: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to remove saved job: ${response.status}`);
    }

    try {
      const data = await response.json();
      console.log('Remove saved job response:', data);
      return data.success === true;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      // If we can't parse the response but the status was OK, assume success
      return true;
    }
  } catch (error) {
    console.error('Error removing saved job:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

/**
 * Check if a job is saved by the current user
 * @param jobId The ID of the job to check
 * @returns Promise<boolean> True if the job is saved
 */
export async function isJobSaved(jobId: string): Promise<boolean> {
  try {
    console.log(`Checking if job with ID ${jobId} is saved`);
    const savedJobs = await fetchSavedJobs();
    const isSaved = savedJobs.some(job => job.id === jobId);
    console.log(`Job ${jobId} is ${isSaved ? 'saved' : 'not saved'}`);
    return isSaved;
  } catch (error) {
    console.error('Error checking if job is saved:', error);
    return false;
  }
}

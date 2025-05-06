export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employer' | 'jobseeker';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

// Mock users data
export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    lastLogin: '2025-05-05T10:30:00Z',
    avatar: '/avatars/admin.png'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'jobseeker',
    status: 'active',
    createdAt: '2025-02-15T00:00:00Z',
    lastLogin: '2025-05-04T14:20:00Z',
    avatar: '/avatars/john.png'
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'jobseeker',
    status: 'active',
    createdAt: '2025-03-10T00:00:00Z',
    lastLogin: '2025-05-03T09:15:00Z',
    avatar: '/avatars/jane.png'
  },
  {
    id: '4',
    name: 'Tech Solutions Inc.',
    email: 'hr@techsolutions.com',
    role: 'employer',
    status: 'active',
    createdAt: '2025-01-20T00:00:00Z',
    lastLogin: '2025-05-05T08:45:00Z',
    avatar: '/avatars/techsolutions.png'
  },
  {
    id: '5',
    name: 'Creative Designs',
    email: 'jobs@creativedesigns.com',
    role: 'employer',
    status: 'active',
    createdAt: '2025-02-05T00:00:00Z',
    lastLogin: '2025-05-02T16:30:00Z',
    avatar: '/avatars/creativedesigns.png'
  },
  {
    id: '6',
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    role: 'jobseeker',
    status: 'inactive',
    createdAt: '2025-03-25T00:00:00Z',
    lastLogin: '2025-04-15T11:20:00Z',
    avatar: '/avatars/michael.png'
  },
  {
    id: '7',
    name: 'Web Innovations',
    email: 'careers@webinnovations.com',
    role: 'employer',
    status: 'active',
    createdAt: '2025-01-15T00:00:00Z',
    lastLogin: '2025-05-01T13:10:00Z',
    avatar: '/avatars/webinnovations.png'
  },
  {
    id: '8',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    role: 'jobseeker',
    status: 'active',
    createdAt: '2025-04-05T00:00:00Z',
    lastLogin: '2025-05-04T10:05:00Z',
    avatar: '/avatars/sarah.png'
  }
];

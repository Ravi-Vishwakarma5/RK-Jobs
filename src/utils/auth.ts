import { User, users } from '@/data/users';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Mock function to simulate authentication
export async function loginUser(credentials: LoginCredentials): Promise<User | null> {
  // In a real application, this would validate against a database
  // and use proper password hashing
  
  // For demo purposes, we'll use hardcoded credentials for admin
  if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
    const user = users.find(u => u.email === credentials.email && u.role === 'admin');
    
    if (user) {
      // Store user in localStorage (in a real app, you'd use a more secure method)
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
  }
  
  return null;
}

// Mock function to simulate registration
export async function registerAdmin(data: RegisterData): Promise<User | null> {
  // In a real application, this would create a new user in the database
  // and use proper password hashing
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === data.email);
  if (existingUser) {
    return null;
  }
  
  // Create new user
  const newUser: User = {
    id: `admin-${Date.now()}`,
    name: data.name,
    email: data.email,
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  
  // In a real app, this would be saved to a database
  // For demo purposes, we'll just store in localStorage
  const updatedUsers = [...users, newUser];
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  return newUser;
}

// Get the current logged-in user
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userJson = localStorage.getItem('currentUser');
  if (!userJson) {
    return null;
  }
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}

// Check if the current user is an admin
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

// Logout the current user
export function logoutUser(): void {
  localStorage.removeItem('currentUser');
}

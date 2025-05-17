export interface User {
  id: string;
  name: string;
  role: 'admin' | 'teacher' | 'parent' | 'student'; // Added student
  email?: string; // Optional
  avatarUrl?: string; // Optional
}

// It might also be useful to have a more specific type for message senders/recipients
// if their structure differs significantly or needs more specific roles.
// For now, User should suffice.

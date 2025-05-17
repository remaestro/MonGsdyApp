import { User } from '../../../core/models/user.model'; // Import User

export interface Attachment { // Define Attachment interface
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url?: string; // Optional URL for download
}

export interface Message {
  id: string;
  subject: string;
  sender: User; // Changed from string to User
  recipients: User[]; // Added recipients
  content: string; // Added content
  createdAt: Date; // Changed from 'date' to 'createdAt' for clarity
  readAt?: Date | null; // Changed from 'isRead' to 'readAt' (Date or null if unread)
  priority: 'normal' | 'high' | 'urgent'; // Added priority
  attachments?: Attachment[]; // Added attachments
  preview?: string; // Kept preview
  link?: string; // Kept link, though might be redundant if routing by ID
}

// This request type can be used when sending a message
export interface MessageRequest {
  subject: string;
  content: string;
  recipients: string[]; // Array of user IDs
  priority: 'normal' | 'high' | 'urgent';
  parentId?: string; // For replies
  attachments?: File[]; // For new attachments
}

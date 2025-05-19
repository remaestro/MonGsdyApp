import { User } from '../../../core/models/user.model'; // Import User

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string; // e.g., 'application/pdf', 'image/jpeg'
  fileUrl: string; // URL to download/view the attachment
  size?: number; // in bytes
}

export type MessagePriority = 'normal' | 'high' | 'urgent'; // Added MessagePriority type

export interface Message {
  id: string;
  subject: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: User['role']; // Use User role type
  };
  recipients: {
    id: string;
    name: string;
    role: User['role']; // Use User role type
  }[]; // Array of recipient objects
  createdAt: Date;
  readAt?: Date;
  isRead?: boolean; // Simplified read status
  attachments?: Attachment[];
  priority?: MessagePriority; // Used MessagePriority type
  parentId?: string; // For threaded messages, optional
}

export interface MessageRequest {
  subject: string;
  content: string;
  recipients: string[]; // Array of user IDs
  priority: MessagePriority; // Used MessagePriority type
  parentId?: string; // For replies
  attachments?: File[]; // For new attachments
}

/**
 * Modèle représentant un document dans l'application
 */
export interface Document {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: 'pdf' | 'image' | 'doc' | 'other';
  createdAt: Date;
  requiresSignature: boolean;
  signedAt?: Date;
  expiresAt?: Date;
}

/**
 * Modèle représentant une signature électronique
 */
export interface Signature {
  documentId: string;
  userId: string;
  signatureData: string;
  signedAt: Date;
  ipAddress: string;
}

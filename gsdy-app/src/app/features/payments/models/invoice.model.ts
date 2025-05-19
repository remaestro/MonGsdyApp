export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'; // Added 'cancelled'

export interface Invoice {
  id: string;
  amount: number;
  description: string;
  dueDate: Date;
  status: InvoiceStatus; // Use InvoiceStatus type
  items: InvoiceItem[];
  childId?: string; // Optionnel, si la facture est liée à un enfant spécifique
  parentId?: string; // Optionnel, pour lier à un parent
  createdAt: Date;
  updatedAt?: Date;
}

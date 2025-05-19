export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // Renommé pour clarté, ou gardez amount si c'est le prix unitaire
  total: number; // quantity * unitPrice
}

export interface Invoice {
  id: string;
  amount: number; // Montant total de la facture
  description: string;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  childId?: string; // Optionnel, si la facture est pour un enfant spécifique
  parentId: string; // Obligatoire pour lier à un parent
  createdAt: Date;
  updatedAt?: Date;
  paymentId?: string; // Si un paiement a été effectué pour cette facture
}

export interface Payment {
  id: string;
  amount: number;
  date: Date; // Date à laquelle le paiement a été effectué/confirmé
  method: 'creditCard' | 'bankTransfer' | 'cash' | 'other';
  status: 'processing' | 'succeeded' | 'failed' | 'pending' | 'requires_action'; // Alignés avec Stripe par exemple
  invoiceId?: string;
  childId?: string; // Optionnel, si le paiement est pour un enfant spécifique
  parentId?: string; // Pour lier à un parent
  transactionId?: string; // ID de transaction du fournisseur de paiement (ex: pi_xxxx pour Stripe)
  clientSecret?: string; // Pour les PaymentIntents de Stripe, stocké temporairement ou si nécessaire
  receiptUrl?: string; // URL du reçu si fourni par le PSP
  createdAt: Date;
  updatedAt?: Date;
}

export interface PaymentIntent {
  id?: string; // L'ID du PaymentIntent (pi_xxxx)
  clientSecret: string;
  amount: number; // Montant en centimes
  currency: string; // ex: 'eur'
  status?: string; // Statut du PaymentIntent de Stripe
  invoiceId?: string; // Pour lier à une facture interne
}

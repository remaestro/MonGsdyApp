import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Invoice {
  id: string;
  amount: number;
  description: string;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: Date;
  method: 'creditCard' | 'bankTransfer' | 'cash' | 'other';
  status: 'processing' | 'completed' | 'failed';
  invoiceId?: string;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  invoiceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  // Récupérer toutes les factures d'un utilisateur
  getUserInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`);
  }

  // Récupérer une facture spécifique
  getInvoice(invoiceId: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/invoices/${invoiceId}`);
  }

  // Créer une intention de paiement avec Stripe
  createPaymentIntent(invoiceId: string): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${this.apiUrl}/create-payment-intent`, { invoiceId });
  }

  // Confirmer un paiement
  confirmPayment(paymentId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/confirm`, { paymentId });
  }

  // Récupérer l'historique des paiements
  getPaymentHistory(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/history`);
  }

  // Télécharger le reçu d'un paiement
  downloadReceipt(paymentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/receipt/${paymentId}`, { responseType: 'blob' });
  }
}

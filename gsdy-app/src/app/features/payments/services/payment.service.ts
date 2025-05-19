import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Payment, PaymentIntent } from '../models/payment.model'; // Models depuis payment.model.ts
import { Invoice } from '../models/invoice.model'; // Model depuis invoice.model.ts
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;
  private invoiceApiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) { }

  // Récupérer toutes les factures d'un utilisateur
  getUserInvoices(userId: string): Observable<Invoice[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<Invoice[]>(`${this.invoiceApiUrl}`, { params }).pipe(
      map(invoices => invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
      catchError(error => {
        console.error(`Erreur lors de la récupération des factures pour l'utilisateur ${userId}`, error);
        return of([]);
      })
    );
  }

  // Récupérer une facture spécifique
  getInvoice(invoiceId: string): Observable<Invoice | undefined> {
    return this.http.get<Invoice>(`${this.invoiceApiUrl}/${invoiceId}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération de la facture ${invoiceId}`, error);
        return of(undefined);
      })
    );
  }

  // Créer une intention de paiement avec Stripe
  createPaymentIntent(amount: number, invoiceId: string, parentId: string): Observable<string> {
    // Le montant doit être en centimes pour Stripe
    return this.http.post<PaymentIntent>(`${this.apiUrl}/create-payment-intent`, { 
      amountInCents: amount * 100, 
      invoiceId, 
      parentId 
    }).pipe(
      map(response => response.clientSecret), // Extraire et retourner uniquement le clientSecret
      catchError(error => {
        console.error(`Erreur lors de la création de l'intention de paiement pour la facture ${invoiceId}`, error);
        return throwError(() => new Error('Failed to create payment intent'));
      })
    );
  }

  // Confirmer un paiement
  confirmPayment(paymentIntentId: string, paymentMethodId: string, invoiceId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/confirm`, { paymentIntentId, paymentMethodId, invoiceId }).pipe(
      catchError(error => {
        console.error(`Erreur lors de la confirmation du paiement ${paymentIntentId}`, error);
        return throwError(() => error);
      })
    );
  }

  // Récupérer l'historique des paiements
  getPaymentHistory(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/history`).pipe(
      map(payments => payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'historique des paiements', error);
        return of([]);
      })
    );
  }

  // Télécharger le reçu d'un paiement
  downloadReceipt(paymentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/receipt/${paymentId}`, { responseType: 'blob' }).pipe(
      catchError(error => {
        console.error(`Erreur lors du téléchargement du reçu pour le paiement ${paymentId}`, error);
        return throwError(() => error);
      })
    );
  }

  getPaymentsByParent(parentId: string): Observable<Payment[]> {
    const params = new HttpParams().set('parentId', parentId);
    return this.http.get<Payment[]>(this.apiUrl, { params }).pipe(
      map(payments => payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
      catchError(error => {
        console.error(`Erreur lors de la récupération des paiements pour le parent ${parentId}`, error);
        return of([]);
      })
    );
  }

  getPaymentById(paymentId: string): Observable<Payment | undefined> {
    return this.http.get<Payment>(`${this.apiUrl}/${paymentId}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération du paiement ${paymentId}`, error);
        return of(undefined);
      })
    );
  }
}

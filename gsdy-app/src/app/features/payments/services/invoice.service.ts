import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Invoice } from './payment.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) { }

  // Récupérer les factures par statut
  getInvoicesByStatus(status: 'pending' | 'paid' | 'overdue'): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}?status=${status}`);
  }

  // Récupérer les détails d'une facture
  getInvoiceDetails(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  // Marquer une facture comme payée
  markAsPaid(id: string): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/${id}/mark-paid`, {});
  }

  // Génération de PDF pour une facture
  generatePdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}

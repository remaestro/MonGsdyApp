import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Invoice } from '../models/invoice.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) { }

  getInvoicesByParent(parentId: string): Observable<Invoice[]> {
    const params = new HttpParams().set('parentId', parentId);
    return this.http.get<Invoice[]>(this.apiUrl, { params }).pipe(
      map(invoices => invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
      catchError(error => {
        console.error(`Erreur lors de la récupération des factures pour le parent ${parentId}`, error);
        return of([]); // Retourner un tableau vide en cas d'erreur
      })
    );
  }

  getInvoiceById(invoiceId: string): Observable<Invoice | undefined> {
    return this.http.get<Invoice>(`${this.apiUrl}/${invoiceId}`).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération de la facture ${invoiceId}`, error);
        return of(undefined); // Retourner undefined en cas d'erreur
      })
    );
  }

  // Potentiellement, ajouter d'autres méthodes pour la gestion des factures si l'admin peut les créer/modifier
  // Exemple: createInvoice, updateInvoiceStatus, etc.
}

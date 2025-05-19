import { Component, OnInit } from '@angular/core';
import { Invoice } from '../../models/invoice.model';
import { InvoiceService } from '../../services/invoice.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  invoices$: Observable<Invoice[]> | undefined;
  currentUserId: string | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private invoiceService: InvoiceService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.currentUserId = this.authService.getCurrentUserId();
    if (this.currentUserId) {
      this.invoices$ = this.invoiceService.getInvoicesByParent(this.currentUserId).pipe(
        tap(() => this.isLoading = false),
        catchError(err => {
          this.error = 'Erreur lors du chargement des factures.';
          this.isLoading = false;
          console.error(err);
          return of([]); // Retourner un tableau vide en cas d'erreur pour que l'UI puisse gérer l'état vide
        })
      );
    } else {
      this.error = 'ID utilisateur non trouvé. Impossible de charger les factures.';
      this.isLoading = false;
      console.error(this.error);
      this.invoices$ = of([]); // Initialiser avec un tableau vide
    }
  }

  getInvoiceStatusClass(invoice: Invoice): string {
    if (!invoice || !invoice.status) {
      return '';
    }
    return `status-${invoice.status.toLowerCase()}`;
  }
}

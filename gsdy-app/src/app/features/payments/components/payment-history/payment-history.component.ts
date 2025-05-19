import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { Payment } from '../../models/payment.model'; // Correction de l'importation
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {
  payments$: Observable<Payment[]> | undefined;
  currentUserId: string | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.currentUserId = this.authService.getCurrentUserId();
    if (this.currentUserId) {
      this.payments$ = this.paymentService.getPaymentsByParent(this.currentUserId).pipe(
        tap(() => this.isLoading = false),
        catchError(err => {
          this.error = "Erreur lors du chargement de l'historique des paiements.";
          this.isLoading = false;
          console.error(err);
          return of([]);
        })
      );
    } else {
      this.error = 'User ID not found for payment history';
      this.isLoading = false;
      console.error(this.error);
      this.payments$ = of([]); // Initialiser avec un tableau vide pour éviter les erreurs de template
    }
  }

  getPaymentStatusClass(payment: Payment): string {
    if (!payment || !payment.status) {
      return '';
    }
    return `status-row-${payment.status.toLowerCase()}`;
  }

  downloadReceipt(paymentId: string): void {
    this.paymentService.downloadReceipt(paymentId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`; // Ou le type de fichier approprié
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, error => {
      console.error('Error downloading receipt:', error);
      this.error = 'Impossible de télécharger le reçu.';
    });
  }
}

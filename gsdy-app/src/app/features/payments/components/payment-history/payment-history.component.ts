import { Component, OnInit } from '@angular/core';
import { PaymentService, Payment } from '../../../services/payment.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-payment-history',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Historique des paiements</h1>
        <a routerLink="/parent/payments" class="text-blue-600 hover:underline flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Retour
        </a>
      </div>
      
      <!-- Message de succès si redirection après paiement réussi -->
      <div *ngIf="showSuccessMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p class="font-medium">Paiement effectué avec succès. Un reçu a été envoyé à votre adresse email.</p>
        </div>
      </div>
      
      <!-- Filtres et recherche -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filtrer par période</label>
            <select 
              [formControl]="periodFilter"
              class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Toutes les périodes</option>
              <option value="thisMonth">Ce mois-ci</option>
              <option value="lastMonth">Le mois dernier</option>
              <option value="thisYear">Cette année</option>
              <option value="lastYear">L'année dernière</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filtrer par statut</label>
            <select 
              [formControl]="statusFilter"
              class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tous les statuts</option>
              <option value="completed">Complété</option>
              <option value="processing">En traitement</option>
              <option value="failed">Échoué</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <div class="relative">
              <input 
                type="text" 
                [formControl]="searchControl"
                placeholder="Rechercher par ID ou description..." 
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <svg class="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Historique des paiements -->
      <div class="bg-white rounded-lg shadow">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-100 text-gray-700 text-left">
                <th class="py-3 px-6">ID Transaction</th>
                <th class="py-3 px-6">Date</th>
                <th class="py-3 px-6">Montant</th>
                <th class="py-3 px-6">Méthode</th>
                <th class="py-3 px-6">Statut</th>
                <th class="py-3 px-6">Facture</th>
                <th class="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let payment of filteredPayments$ | async" class="border-b hover:bg-gray-50">
                <td class="py-3 px-6">{{ payment.id }}</td>
                <td class="py-3 px-6">{{ payment.date | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="py-3 px-6">{{ payment.amount | currency:'EUR' }}</td>
                <td class="py-3 px-6">{{ getPaymentMethodLabel(payment.method) }}</td>
                <td class="py-3 px-6">
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': payment.status === 'completed',
                    'bg-yellow-100 text-yellow-800': payment.status === 'processing',
                    'bg-red-100 text-red-800': payment.status === 'failed'
                  }" class="px-2 py-1 rounded text-sm font-semibold">
                    {{ getStatusLabel(payment.status) }}
                  </span>
                </td>
                <td class="py-3 px-6">
                  <a 
                    *ngIf="payment.invoiceId"
                    [routerLink]="['/parent/payments/invoice', payment.invoiceId, 'details']"
                    class="text-blue-600 hover:underline">
                    {{ payment.invoiceId }}
                  </a>
                  <span *ngIf="!payment.invoiceId">-</span>
                </td>
                <td class="py-3 px-6">
                  <button 
                    (click)="downloadReceipt(payment.id)"
                    class="bg-gray-200 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-300 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Reçu
                  </button>
                </td>
              </tr>
              <tr *ngIf="(filteredPayments$ | async)?.length === 0">
                <td colspan="7" class="py-4 text-center text-gray-500">
                  Aucun paiement trouvé
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Résumé des paiements -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Résumé des paiements</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-gray-600 mb-1">Total payé</div>
            <div class="text-2xl font-bold text-green-600">{{ totalPaid | currency:'EUR' }}</div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-gray-600 mb-1">Paiements ce mois-ci</div>
            <div class="text-2xl font-bold text-blue-600">{{ currentMonthTotal | currency:'EUR' }}</div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-gray-600 mb-1">Nombre de transactions</div>
            <div class="text-2xl font-bold text-indigo-600">{{ paymentsCount }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PaymentHistoryComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments$: Observable<Payment[]>;
  
  periodFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  searchControl = new FormControl('');
  
  totalPaid = 0;
  currentMonthTotal = 0;
  paymentsCount = 0;
  
  showSuccessMessage = false;

  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Vérifier si on vient d'un paiement réussi
    this.route.queryParams.subscribe(params => {
      this.showSuccessMessage = params['success'] === 'true';
    });
    
    // Charger les paiements
    this.paymentService.getPaymentHistory().subscribe(payments => {
      this.payments = payments;
      this.calculateTotals(payments);
    });
    
    // Configurer les filtres réactifs
    this.filteredPayments$ = this.observeFilters();
  }

  observeFilters(): Observable<Payment[]> {
    return this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(() => this.filterPayments())
    );
  }

  filterPayments(): Payment[] {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const periodValue = this.periodFilter.value;
    const statusValue = this.statusFilter.value;
    
    return this.payments.filter(payment => {
      // Filtre de recherche
      const matchesSearch = searchTerm === '' || 
        payment.id.toLowerCase().includes(searchTerm) || 
        (payment.invoiceId?.toLowerCase().includes(searchTerm));
      
      // Filtre de période
      let matchesPeriod = true;
      const paymentDate = new Date(payment.date);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (periodValue === 'thisMonth') {
        matchesPeriod = paymentDate.getMonth() === currentMonth && 
                     paymentDate.getFullYear() === currentYear;
      } else if (periodValue === 'lastMonth') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        matchesPeriod = paymentDate.getMonth() === lastMonth && 
                     paymentDate.getFullYear() === lastMonthYear;
      } else if (periodValue === 'thisYear') {
        matchesPeriod = paymentDate.getFullYear() === currentYear;
      } else if (periodValue === 'lastYear') {
        matchesPeriod = paymentDate.getFullYear() === currentYear - 1;
      }
      
      // Filtre de statut
      const matchesStatus = statusValue === 'all' || payment.status === statusValue;
      
      return matchesSearch && matchesPeriod && matchesStatus;
    });
  }

  calculateTotals(payments: Payment[]): void {
    // Total de tous les paiements complétés
    this.totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Total des paiements du mois courant
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    this.currentMonthTotal = payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        return p.status === 'completed' && 
               paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Nombre total de transactions
    this.paymentsCount = payments.length;
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'creditCard':
        return 'Carte bancaire';
      case 'bankTransfer':
        return 'Virement bancaire';
      case 'cash':
        return 'Espèces';
      default:
        return 'Autre';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'processing':
        return 'En traitement';
      case 'failed':
        return 'Échoué';
      default:
        return status;
    }
  }

  downloadReceipt(paymentId: string): void {
    this.paymentService.downloadReceipt(paymentId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-paiement-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }
}

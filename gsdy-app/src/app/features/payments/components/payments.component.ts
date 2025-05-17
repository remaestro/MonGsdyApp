import { Component, OnInit } from '@angular/core';
import { PaymentService, Invoice } from '../../services/payment.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-payments',
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Gestion des paiements</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Carte résumé -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-3">Résumé</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span>Total dû:</span>
              <span class="font-bold text-red-600">{{ getTotalDue() | currency:'EUR' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Derniers paiements:</span>
              <span>{{ lastPaymentDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Factures en attente:</span>
              <span class="font-bold">{{ pendingInvoicesCount }}</span>
            </div>
            <button 
              (click)="navigateToHistory()"
              class="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              Voir l'historique
            </button>
          </div>
        </div>
        
        <!-- Navigation des actions -->
        <div class="md:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a routerLink="/parent/payments/invoices" 
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <svg class="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 class="text-xl font-semibold mb-2">Mes factures</h3>
              <p class="text-gray-600">Consultez et payez vos factures en attente</p>
            </a>
            
            <a routerLink="/parent/payments/history" 
              class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <svg class="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 class="text-xl font-semibold mb-2">Historique</h3>
              <p class="text-gray-600">Consultez l'historique de tous vos paiements</p>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Liste des factures récentes -->
      <div class="mt-8">
        <h2 class="text-2xl font-semibold mb-4">Factures récentes</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr class="bg-gray-100 text-gray-700">
                <th class="py-3 px-4 text-left">Description</th>
                <th class="py-3 px-4 text-left">Date d'échéance</th>
                <th class="py-3 px-4 text-left">Montant</th>
                <th class="py-3 px-4 text-left">Statut</th>
                <th class="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let invoice of recentInvoices$ | async" class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">{{ invoice.description }}</td>
                <td class="py-3 px-4">{{ invoice.dueDate | date:'dd/MM/yyyy' }}</td>
                <td class="py-3 px-4">{{ invoice.amount | currency:'EUR' }}</td>
                <td class="py-3 px-4">
                  <span [ngClass]="{
                    'bg-yellow-100 text-yellow-800': invoice.status === 'pending',
                    'bg-green-100 text-green-800': invoice.status === 'paid',
                    'bg-red-100 text-red-800': invoice.status === 'overdue'
                  }" class="px-2 py-1 rounded text-sm font-semibold">
                    {{ getStatusLabel(invoice.status) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button 
                    *ngIf="invoice.status !== 'paid'"
                    (click)="navigateToPayment(invoice.id)" 
                    class="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition">
                    Payer
                  </button>
                  <button 
                    (click)="viewInvoice(invoice.id)"
                    class="ml-2 bg-gray-200 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-300 transition">
                    Détails
                  </button>
                </td>
              </tr>
              <tr *ngIf="(recentInvoices$ | async)?.length === 0">
                <td colspan="5" class="py-4 text-center text-gray-500">
                  Aucune facture récente
                </td>
              </tr>
            </tbody>
          </table>
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
export class PaymentsComponent implements OnInit {
  recentInvoices$: Observable<Invoice[]>;
  pendingInvoicesCount = 0;
  lastPaymentDate: Date | null = null;
  
  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {
    this.recentInvoices$ = this.paymentService.getUserInvoices();
  }

  ngOnInit(): void {
    this.loadPendingInvoices();
    this.loadLastPaymentDate();
  }

  loadPendingInvoices(): void {
    this.paymentService.getUserInvoices().subscribe(invoices => {
      this.pendingInvoicesCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;
    });
  }

  loadLastPaymentDate(): void {
    this.paymentService.getPaymentHistory().subscribe(payments => {
      if (payments.length > 0) {
        this.lastPaymentDate = payments.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0].date;
      }
    });
  }

  getTotalDue(): number {
    let total = 0;
    this.paymentService.getUserInvoices().subscribe(invoices => {
      total = invoices
        .filter(invoice => invoice.status !== 'paid')
        .reduce((acc, invoice) => acc + invoice.amount, 0);
    });
    return total;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'paid':
        return 'Payé';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  }

  navigateToPayment(invoiceId: string): void {
    this.router.navigate(['/parent/payments/invoice', invoiceId]);
  }

  navigateToHistory(): void {
    this.router.navigate(['/parent/payments/history']);
  }

  viewInvoice(invoiceId: string): void {
    this.router.navigate(['/parent/payments/invoice', invoiceId, 'details']);
  }
}

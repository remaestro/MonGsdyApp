import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../../../services/invoice.service';
import { Invoice } from '../../../services/payment.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-list',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Mes factures</h1>
        <a routerLink="/parent/payments" class="text-blue-600 hover:underline flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Retour
        </a>
      </div>
      
      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filtrer par statut</label>
            <div class="flex space-x-2">
              <button 
                [ngClass]="{'bg-blue-600 text-white': activeFilter === 'all', 'bg-gray-200 text-gray-700': activeFilter !== 'all'}"
                (click)="filterByStatus('all')"
                class="px-4 py-2 rounded text-sm font-medium transition">
                Tous
              </button>
              <button 
                [ngClass]="{'bg-blue-600 text-white': activeFilter === 'pending', 'bg-gray-200 text-gray-700': activeFilter !== 'pending'}"
                (click)="filterByStatus('pending')"
                class="px-4 py-2 rounded text-sm font-medium transition">
                En attente
              </button>
              <button 
                [ngClass]="{'bg-blue-600 text-white': activeFilter === 'paid', 'bg-gray-200 text-gray-700': activeFilter !== 'paid'}"
                (click)="filterByStatus('paid')"
                class="px-4 py-2 rounded text-sm font-medium transition">
                Payées
              </button>
              <button 
                [ngClass]="{'bg-blue-600 text-white': activeFilter === 'overdue', 'bg-gray-200 text-gray-700': activeFilter !== 'overdue'}"
                (click)="filterByStatus('overdue')"
                class="px-4 py-2 rounded text-sm font-medium transition">
                En retard
              </button>
            </div>
          </div>
          
          <div class="md:col-span-2 flex items-end justify-end">
            <div class="relative">
              <input 
                type="text" 
                placeholder="Rechercher une facture..." 
                [(ngModel)]="searchTerm"
                (input)="applyFilter()"
                class="w-full md:w-80 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <svg class="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Liste des factures -->
      <div class="bg-white rounded-lg shadow">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-100 text-gray-700 text-left">
                <th class="py-3 px-6">N° Facture</th>
                <th class="py-3 px-6">Description</th>
                <th class="py-3 px-6">Date d'émission</th>
                <th class="py-3 px-6">Date d'échéance</th>
                <th class="py-3 px-6">Montant</th>
                <th class="py-3 px-6">Statut</th>
                <th class="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let invoice of filteredInvoices" class="border-b hover:bg-gray-50">
                <td class="py-3 px-6">{{ invoice.id }}</td>
                <td class="py-3 px-6">{{ invoice.description }}</td>
                <td class="py-3 px-6">{{ invoice.createdAt | date:'dd/MM/yyyy' }}</td>
                <td class="py-3 px-6">{{ invoice.dueDate | date:'dd/MM/yyyy' }}</td>
                <td class="py-3 px-6">{{ invoice.amount | currency:'EUR' }}</td>
                <td class="py-3 px-6">
                  <span [ngClass]="{
                    'bg-yellow-100 text-yellow-800': invoice.status === 'pending',
                    'bg-green-100 text-green-800': invoice.status === 'paid',
                    'bg-red-100 text-red-800': invoice.status === 'overdue'
                  }" class="px-2 py-1 rounded text-sm font-semibold">
                    {{ getStatusLabel(invoice.status) }}
                  </span>
                </td>
                <td class="py-3 px-6">
                  <button 
                    *ngIf="invoice.status !== 'paid'"
                    (click)="payInvoice(invoice.id)" 
                    class="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 mr-2">
                    Payer
                  </button>
                  <button 
                    (click)="viewInvoice(invoice.id)"
                    class="bg-gray-200 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-300 mr-2">
                    Détails
                  </button>
                  <button 
                    (click)="downloadPdf(invoice.id)"
                    class="bg-gray-200 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-300">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredInvoices.length === 0">
                <td colspan="7" class="py-4 text-center text-gray-500">
                  Aucune facture trouvée
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
export class InvoiceListComponent implements OnInit {
  allInvoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  activeFilter: 'all' | 'pending' | 'paid' | 'overdue' = 'all';
  searchTerm: string = '';

  constructor(
    private invoiceService: InvoiceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Chargement des trois types d'état de factures
    combineLatest([
      this.invoiceService.getInvoicesByStatus('pending'),
      this.invoiceService.getInvoicesByStatus('paid'),
      this.invoiceService.getInvoicesByStatus('overdue')
    ]).pipe(
      map(([pending, paid, overdue]) => [...pending, ...paid, ...overdue])
    ).subscribe(invoices => {
      this.allInvoices = invoices;
      this.applyFilter();
    });
  }

  filterByStatus(status: 'all' | 'pending' | 'paid' | 'overdue'): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = this.allInvoices;
    
    // Appliquer le filtre par statut s'il n'est pas "all"
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === this.activeFilter);
    }
    
    // Appliquer la recherche textuelle
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.id.toLowerCase().includes(term) || 
        invoice.description.toLowerCase().includes(term)
      );
    }
    
    this.filteredInvoices = filtered;
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

  payInvoice(invoiceId: string): void {
    this.router.navigate(['/parent/payments/invoice', invoiceId]);
  }

  viewInvoice(invoiceId: string): void {
    this.router.navigate(['/parent/payments/invoice', invoiceId, 'details']);
  }

  downloadPdf(invoiceId: string): void {
    this.invoiceService.generatePdf(invoiceId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }
}

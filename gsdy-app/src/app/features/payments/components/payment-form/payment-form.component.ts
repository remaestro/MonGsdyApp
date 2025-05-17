import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService, Invoice } from '../../../services/payment.service';
import { ToastService } from '../../../../../core/notifications/services/toast.service';
import { switchMap, tap } from 'rxjs/operators';

declare var Stripe: any;

@Component({
  selector: 'app-payment-form',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Payer la facture</h1>
        <a routerLink="/parent/payments/invoices" class="text-blue-600 hover:underline flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Retour aux factures
        </a>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Résumé de la facture -->
        <div class="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Résumé de la facture</h2>
          
          <div *ngIf="invoice" class="space-y-4">
            <div class="flex justify-between items-center border-b pb-2">
              <span class="text-gray-600">N° Facture:</span>
              <span class="font-medium">{{ invoice.id }}</span>
            </div>
            <div class="flex justify-between items-center border-b pb-2">
              <span class="text-gray-600">Description:</span>
              <span class="font-medium">{{ invoice.description }}</span>
            </div>
            <div class="flex justify-between items-center border-b pb-2">
              <span class="text-gray-600">Date d'échéance:</span>
              <span class="font-medium">{{ invoice.dueDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <div *ngIf="invoice.status === 'overdue'" class="bg-red-100 text-red-700 p-3 rounded-md my-3">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clip-rule="evenodd"></path>
                </svg>
                <p>Cette facture est en retard de paiement.</p>
              </div>
            </div>
            
            <h3 class="text-lg font-semibold mt-4 mb-2">Détails</h3>
            <div *ngFor="let item of invoice?.items" class="flex justify-between items-center border-b pb-2 last:border-0">
              <span class="text-gray-600">{{ item.description }}</span>
              <span class="font-medium">{{ item.quantity }} x {{ item.amount | currency:'EUR' }}</span>
            </div>
            
            <div class="mt-6 pt-4 border-t">
              <div class="flex justify-between items-center text-lg">
                <span class="font-semibold">Total:</span>
                <span class="font-bold text-blue-700">{{ invoice.amount | currency:'EUR' }}</span>
              </div>
            </div>
          </div>
          
          <div *ngIf="!invoice" class="flex items-center justify-center h-48">
            <div class="text-center">
              <svg class="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Chargement des détails de la facture...</p>
            </div>
          </div>
        </div>
        
        <!-- Formulaire de paiement -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Informations de paiement</h2>
          
          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-4">
              <div>
                <label for="cardholderName" class="block text-sm font-medium text-gray-700 mb-1">Nom du titulaire</label>
                <input 
                  type="text" 
                  id="cardholderName" 
                  formControlName="cardholderName" 
                  class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Nom tel qu'il apparaît sur la carte" />
                <div *ngIf="submitted && paymentForm.get('cardholderName')?.errors?.required" class="mt-1 text-red-600 text-sm">
                  Le nom est obligatoire
                </div>
              </div>
              
              <div>
                <label for="cardElement" class="block text-sm font-medium text-gray-700 mb-1">
                  Informations de la carte
                </label>
                <div id="cardElement" #cardElement class="p-3 border rounded-md bg-gray-50"></div>
                <div id="cardErrors" class="mt-1 text-red-600 text-sm"></div>
              </div>
              
              <div>
                <label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">
                  Méthode de paiement
                </label>
                <select 
                  id="paymentMethod" 
                  formControlName="paymentMethod" 
                  class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="creditCard">Carte de crédit</option>
                  <option value="bankTransfer">Virement bancaire</option>
                </select>
              </div>
              
              <div class="flex items-start mt-4">
                <input 
                  type="checkbox" 
                  id="saveCard" 
                  formControlName="saveCard" 
                  class="mt-1" />
                <label for="saveCard" class="ml-2 block text-sm text-gray-700">
                  Enregistrer cette carte pour mes futurs paiements
                </label>
              </div>
            </div>
            
            <div class="pt-4 border-t flex items-center justify-between">
              <div class="text-sm text-gray-600">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span>Paiement sécurisé via Stripe</span>
                </div>
              </div>
              <button 
                type="submit"
                [disabled]="loading || !paymentForm.valid"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                <span *ngIf="!loading">Payer {{ invoice?.amount | currency:'EUR' }}</span>
                <span *ngIf="loading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement en cours...
                </span>
              </button>
            </div>
          </form>
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
export class PaymentFormComponent implements OnInit {
  @ViewChild('cardElement') cardElement: ElementRef;
  
  invoice: Invoice | null = null;
  paymentForm: FormGroup;
  submitted = false;
  loading = false;
  
  private stripe: any;
  private card: any;
  private invoiceId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    private toastService: ToastService
  ) {
    this.paymentForm = this.formBuilder.group({
      cardholderName: ['', Validators.required],
      paymentMethod: ['creditCard', Validators.required],
      saveCard: [false]
    });
  }

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.invoiceId) {
      this.paymentService.getInvoice(this.invoiceId).subscribe(
        invoice => {
          this.invoice = invoice;
          
          // Si la facture est déjà payée, rediriger vers la liste
          if (invoice.status === 'paid') {
            this.toastService.showInfo('Cette facture a déjà été payée.');
            this.router.navigate(['/parent/payments/invoices']);
          }
        },
        error => {
          this.toastService.showError('Impossible de charger les détails de la facture.');
          this.router.navigate(['/parent/payments']);
        }
      );
    } else {
      this.router.navigate(['/parent/payments']);
    }
  }

  ngAfterViewInit(): void {
    // Initialiser Stripe
    this.stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');
    const elements = this.stripe.elements();
    
    // Créer l'élément de carte
    this.card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
        }
      }
    });
    
    // Monter l'élément de carte dans le DOM
    this.card.mount(this.cardElement.nativeElement);
    
    // Gérer les erreurs de validation
    this.card.addEventListener('change', (event: any) => {
      const displayError = document.getElementById('cardErrors');
      if (displayError) {
        displayError.textContent = event.error ? event.error.message : '';
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.paymentForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Créer une intention de paiement
    this.paymentService.createPaymentIntent(this.invoiceId)
      .pipe(
        tap(() => {
          // Affichage d'un message d'attente
          this.toastService.showInfo('Traitement du paiement en cours...');
        }),
        switchMap(paymentIntent => {
          // Confirmer le paiement avec Stripe
          return this.stripe.confirmCardPayment(paymentIntent.clientSecret, {
            payment_method: {
              card: this.card,
              billing_details: {
                name: this.paymentForm.value.cardholderName
              }
            }
          });
        })
      )
      .subscribe(
        (result: any) => {
          this.loading = false;
          
          if (result.error) {
            // Erreur lors du paiement
            this.toastService.showError(`Erreur de paiement: ${result.error.message}`);
          } else {
            // Paiement réussi
            if (result.paymentIntent.status === 'succeeded') {
              this.toastService.showSuccess('Paiement effectué avec succès !');
              
              // Confirmer le paiement côté serveur
              this.paymentService.confirmPayment(result.paymentIntent.id).subscribe(
                () => {
                  this.router.navigate(['/parent/payments/history'], {
                    queryParams: { success: true }
                  });
                },
                error => {
                  this.toastService.showWarning('Paiement enregistré mais une erreur est survenue lors de la mise à jour du statut.');
                  this.router.navigate(['/parent/payments/history']);
                }
              );
            }
          }
        },
        error => {
          this.loading = false;
          this.toastService.showError('Erreur lors du traitement du paiement. Veuillez réessayer.');
        }
      );
  }

  ngOnDestroy(): void {
    if (this.card) {
      this.card.destroy();
    }
  }
}

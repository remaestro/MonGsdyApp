import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { PaymentService } from '../../services/payment.service';
import { Invoice } from '../../models/invoice.model';
import { Observable, switchMap, tap, catchError, of, firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css']
})
export class PaymentFormComponent implements OnInit, OnDestroy {
  @ViewChild('cardElement') cardElementRef: ElementRef | undefined;

  stripe: Stripe | null = null;
  elements: StripeElements | undefined;
  card: StripeCardElement | undefined;

  invoice$: Observable<Invoice | undefined> | undefined;
  invoice: Invoice | undefined;
  isLoading = true;
  error: string | null = null;
  currentUserId: string | null = null;
  paymentProcessing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.authService.getCurrentUserId();
    if (!this.currentUserId) {
      this.error = 'Utilisateur non authentifié.';
      this.isLoading = false;
      return;
    }

    try {
      this.stripe = await loadStripe(environment.stripePublishableKey);
      if (this.stripe) {
        this.elements = this.stripe.elements();
        this.card = this.elements.create('card', { /* Options de style ici si besoin */ });
      } else {
        throw new Error('Stripe.js n\'a pas pu être chargé.');
      }
    } catch (e: any) {
      this.error = e.message || 'Impossible d\'initialiser Stripe.';
      this.isLoading = false;
      return;
    }

    this.invoice$ = this.route.paramMap.pipe(
      switchMap(params => {
        const invoiceId = params.get('id');
        if (invoiceId) {
          this.isLoading = true;
          return this.invoiceService.getInvoiceById(invoiceId).pipe(
            tap(invoice => {
              this.invoice = invoice;
              this.isLoading = false;
              if (!invoice) {
                this.error = 'Facture non trouvée.';
              } else if (this.card && this.cardElementRef?.nativeElement) {
                this.card.mount(this.cardElementRef.nativeElement);
              } else if (!this.cardElementRef?.nativeElement) {
                console.warn("cardElementRef.nativeElement n'est pas encore disponible. Le montage de la carte Stripe sera retardé ou pourrait échouer si la vue n'est pas prête.");
              }
            }),
            catchError(err => {
              this.error = 'Erreur lors du chargement de la facture.';
              this.isLoading = false;
              console.error(err);
              return of(undefined);
            })
          );
        } else {
          this.error = 'ID de facture manquant.';
          this.isLoading = false;
          return of(undefined);
        }
      })
    );
  }

  async submitPayment(): Promise<void> {
    if (!this.invoice || !this.currentUserId || !this.stripe || !this.card || !this.cardElementRef?.nativeElement) {
      this.error = 'Impossible de traiter le paiement : données manquantes, Stripe non initialisé, ou élément carte non prêt.';
      if (!this.cardElementRef?.nativeElement) {
        console.error("Tentative de soumission du paiement mais cardElementRef.nativeElement n'est pas disponible.");
      }
      return;
    }

    if (this.invoice.status === 'paid') {
      this.error = 'Cette facture a déjà été payée.';
      return;
    }

    this.paymentProcessing = true;
    this.error = null;

    try {
      const clientSecret = await firstValueFrom(
        this.paymentService.createPaymentIntent(this.invoice.amount, this.invoice.id, this.currentUserId)
      );

      if (!clientSecret) {
        this.error = 'Impossible de récupérer le client secret pour le paiement.';
        this.paymentProcessing = false;
        return;
      }

      const currentUser = this.authService.getCurrentUserSync();
      const billingDetails: any = {
        name: currentUser?.displayName || 'Nom du client Inconnu',
      };
      if (currentUser?.email) {
        billingDetails.email = currentUser.email;
      }

      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: billingDetails,
        },
      });

      if (result.error) {
        this.error = result.error.message || 'Erreur de paiement Stripe.';
      } else {
        if (result.paymentIntent?.status === 'succeeded') {
          console.log('Paiement Stripe réussi:', result.paymentIntent);
          alert('Paiement effectué avec succès!');
          if (this.invoice) {
            this.invoice.status = 'paid';
          }
          this.router.navigate(['/parent/payments/history']);
        } else {
          this.error = `Le statut du paiement est inattendu: ${result.paymentIntent?.status}`;
        }
      }
    } catch (err: any) {
      console.error('Erreur de paiement:', err);
      this.error = err.message || 'Le paiement a échoué. Veuillez réessayer.';
    } finally {
      this.paymentProcessing = false;
    }
  }

  ngOnDestroy(): void {
    if (this.card) {
      this.card.destroy();
    }
  }
}

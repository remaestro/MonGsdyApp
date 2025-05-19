import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PaymentFormComponent } from './payment-form.component';
import { PaymentService } from '../../services/payment.service';
import { InvoiceService } from '../../services/invoice.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Invoice } from '../../models/invoice.model';
import { User } from '../../../../core/models/user.model';
import * as stripeJs from '@stripe/stripe-js'; // Import all exports from @stripe/stripe-js
import { StripeCardElement } from '@stripe/stripe-js'; // Import StripeCardElement for typing

// Mocks pour Stripe.js
const mockStripeElement = {
  mount: jasmine.createSpy('mount'),
  destroy: jasmine.createSpy('destroy'),
  on: jasmine.createSpy('on'),
  update: jasmine.createSpy('update'),
};

const mockElements = {
  create: jasmine.createSpy('create').and.returnValue(mockStripeElement as unknown as StripeCardElement),
};

const mockStripeInstance = {
  elements: jasmine.createSpy('elements').and.returnValue(mockElements),
  confirmCardPayment: jasmine.createSpy('confirmCardPayment'),
};

// Espionner loadStripe et le faire retourner notre mockStripe
let loadStripeSpy: jasmine.Spy< (pk: string, options?: stripeJs.StripeConstructorOptions) => Promise<stripeJs.Stripe | null> >;

const mockEnvironment = {
  stripePublishableKey: 'pk_test_mocked',
  production: false,
  apiUrl: 'http://localhost:4200/api',
  debug: true
};

describe('PaymentFormComponent', () => {
  let component: PaymentFormComponent;
  let fixture: ComponentFixture<PaymentFormComponent>;
  let mockPaymentService: jasmine.SpyObj<PaymentService>;
  let mockInvoiceService: jasmine.SpyObj<InvoiceService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: Router;
  let mockActivatedRoute: any;

  const mockUser: User = { id: 'user1', name: 'Test User', email: 'test@example.com', role: 'parent' };
  const mockInvoice: Invoice = {
    id: 'inv1',
    amount: 100,
    description: 'Test Invoice',
    dueDate: new Date(),
    status: 'pending',
    items: [],
    parentId: 'user1',
    createdAt: new Date()
  };

  beforeAll(() => {
    loadStripeSpy = spyOn(stripeJs, 'loadStripe').and.returnValue(Promise.resolve(mockStripeInstance as any));
  });

  beforeEach(async () => {
    mockPaymentService = jasmine.createSpyObj('PaymentService', ['createPaymentIntent']);
    mockInvoiceService = jasmine.createSpyObj('InvoiceService', ['getInvoiceById']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUserId', 'getCurrentUserSync']);

    mockActivatedRoute = {
      paramMap: of({ get: (key: string) => mockInvoice.id })
    };

    await TestBed.configureTestingModule({
      imports: [
        PaymentFormComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        FormsModule,
        CommonModule
      ],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentFormComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'navigate');

    mockAuthService.getCurrentUserId.and.returnValue(mockUser.id);
    mockAuthService.getCurrentUserSync.and.returnValue(mockUser);
    mockInvoiceService.getInvoiceById.and.returnValue(of(mockInvoice));
    mockPaymentService.createPaymentIntent.and.returnValue(of('pi_123_secret_456'));

    component.cardElementRef = { nativeElement: document.createElement('div') } as any;
  });

  afterAll(() => {
    // Les espions créés avec spyOn sont généralement restaurés automatiquement par Jasmine.
    // Si une restauration explicite est nécessaire pour loadStripeSpy, elle peut être faite ici.
    // Par exemple: loadStripeSpy.and.callThrough(); ou mockReset si disponible pour les espions de module.
    // Pour l'instant, nous nous fions à la restauration automatique de Jasmine.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize and load invoice if user is authenticated and invoiceId is present', fakeAsync(() => {
      fixture.detectChanges(); 
      tick(); 
      
      expect(mockAuthService.getCurrentUserId).toHaveBeenCalled();
      expect(loadStripeSpy).toHaveBeenCalledWith(mockEnvironment.stripePublishableKey);
      expect(component.stripe).toEqual(mockStripeInstance as any);
      expect(component.elements).toEqual(mockElements as any);
      expect(component.card).toEqual(mockStripeElement as unknown as StripeCardElement);
      expect(mockInvoiceService.getInvoiceById).toHaveBeenCalledWith(mockInvoice.id);
      expect(component.invoice).toEqual(mockInvoice);
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
      expect(mockStripeElement.mount).toHaveBeenCalledWith(component.cardElementRef?.nativeElement);
    }));

    it('should set error if user is not authenticated', fakeAsync(() => {
      mockAuthService.getCurrentUserId.and.returnValue(null);
      fixture.detectChanges();
      tick();
      expect(component.error).toBe('Utilisateur non authentifié.');
      expect(component.isLoading).toBeFalse();
    }));

    it('should set error if Stripe fails to load', fakeAsync(() => {
      loadStripeSpy.and.returnValue(Promise.resolve(null));
      fixture.detectChanges();
      tick();
      expect(component.error).toBe('Impossible d\'initialiser Stripe.');
      expect(component.isLoading).toBeFalse();
    }));
    
    it('should set error if invoiceId is missing', fakeAsync(() => {
      mockActivatedRoute.paramMap = of({ get: (key: string) => null });
      fixture.detectChanges();
      tick();
      expect(component.error).toBe('ID de facture manquant.');
      expect(component.isLoading).toBeFalse();
    }));

    it('should set error if invoice is not found', fakeAsync(() => {
      mockInvoiceService.getInvoiceById.and.returnValue(of(undefined));
      fixture.detectChanges();
      tick();
      expect(component.error).toBe('Facture non trouvée.');
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle error when getInvoiceById fails', fakeAsync(() => {
      mockInvoiceService.getInvoiceById.and.returnValue(throwError(() => new Error('API Error')));
      fixture.detectChanges();
      tick();
      expect(component.error).toBe('Erreur lors du chargement de la facture.');
      expect(component.isLoading).toBeFalse();
    }));
  });

  describe('submitPayment', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges(); 
      tick(); 
    }));

    it('should process payment successfully', fakeAsync(() => {
      mockStripeInstance.confirmCardPayment.and.returnValue(Promise.resolve({ paymentIntent: { status: 'succeeded' } }));
      component.submitPayment();
      tick(); 

      expect(mockPaymentService.createPaymentIntent).toHaveBeenCalledWith(mockInvoice.amount, mockInvoice.id, mockUser.id);
      expect(mockStripeInstance.confirmCardPayment).toHaveBeenCalledWith('pi_123_secret_456', jasmine.any(Object));
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/parent/payments/history']);
      expect(component.paymentProcessing).toBeFalse();
      expect(component.error).toBeNull();
    }));

    it('should set error if invoice is already paid', fakeAsync(() => {
      component.invoice!.status = 'paid';
      component.submitPayment();
      tick();
      expect(component.error).toBe('Cette facture a déjà été payée.');
      expect(component.paymentProcessing).toBeFalse();
    }));

    it('should handle payment confirmation error', fakeAsync(() => {
      mockStripeInstance.confirmCardPayment.and.returnValue(Promise.resolve({ error: { message: 'Payment failed' } }));
      component.submitPayment();
      tick();
      expect(component.error).toBe('Payment failed');
      expect(component.paymentProcessing).toBeFalse();
    }));

    it('should handle createPaymentIntent error', fakeAsync(() => {
      mockPaymentService.createPaymentIntent.and.returnValue(throwError(() => new Error('Intent creation failed')));
      component.submitPayment();
      tick();
      expect(component.error).toBe('Erreur lors de la création de l\'intention de paiement.');
      expect(component.paymentProcessing).toBeFalse();
    }));

    it('should not proceed if form is invalid (card error)', fakeAsync(() => {
      component.invoice = undefined;
      component.submitPayment();
      tick();
      expect(mockPaymentService.createPaymentIntent).not.toHaveBeenCalled();
      expect(component.paymentProcessing).toBeFalse();
      expect(component.error).toBe('Facture non chargée.');
    }));

    it('should not proceed if invoice is not loaded', fakeAsync(() => {
      component.invoice = undefined;
      component.submitPayment();
      tick();
      expect(mockPaymentService.createPaymentIntent).not.toHaveBeenCalled();
      expect(component.paymentProcessing).toBeFalse();
      expect(component.error).toBe('Facture non chargée.');
    }));

    it('should not proceed if stripe objects are not initialized', fakeAsync(() => {
      component.stripe = null;
      component.submitPayment();
      tick();
      expect(mockPaymentService.createPaymentIntent).not.toHaveBeenCalled();
      expect(component.paymentProcessing).toBeFalse();
      expect(component.error).toBe('Stripe n\'est pas initialisé.');
    }));
  });

  describe('ngOnDestroy', () => {
    it('should destroy stripe card element if it exists', fakeAsync(() => {
      fixture.detectChanges(); 
      tick(); 
      expect(component.card).toBeTruthy();
      component.ngOnDestroy();
      expect(mockStripeElement.destroy).toHaveBeenCalled();
    }));

    it('should not throw error if card element does not exist on destroy', () => {
      component.card = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});

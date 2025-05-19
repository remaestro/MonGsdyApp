import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { PaymentHistoryComponent } from './payment-history.component';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Payment } from '../../models/payment.model';
import { User } from '../../../../core/models/user.model';
import { ChangeDetectorRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('PaymentHistoryComponent', () => {
  let component: PaymentHistoryComponent;
  let fixture: ComponentFixture<PaymentHistoryComponent>;
  let paymentService: jasmine.SpyObj<PaymentService>;
  let authService: jasmine.SpyObj<AuthService>;
  let cdr: ChangeDetectorRef;

  const mockPayment1: Payment = { id: '1', amount: 100, date: new Date(), method: 'creditCard', status: 'succeeded', parentId: 'parent1', createdAt: new Date(), receiptUrl: 'receipt1.pdf' };
  const mockPayment2: Payment = { id: '2', amount: 200, date: new Date(), method: 'bankTransfer', status: 'pending', parentId: 'parent1', createdAt: new Date() };
  const mockPayments: Payment[] = [mockPayment1, mockPayment2];

  const mockUser: User = {
    id: 'parent1',
    email: 'parent@example.com',
    name: 'Parent Test',
    role: 'parent',
  };

  beforeEach(waitForAsync(() => {
    const paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['getPaymentsByParent', 'downloadReceipt']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);

    TestBed.configureTestingModule({
      imports: [
        PaymentHistoryComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PaymentService, useValue: paymentServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentHistoryComponent);
    component = fixture.componentInstance;
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
    paymentService = TestBed.inject(PaymentService) as jasmine.SpyObj<PaymentService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.getCurrentUserId.and.returnValue(mockUser.id);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load payment history if user is authenticated', fakeAsync(() => {
      paymentService.getPaymentsByParent.and.returnValue(of(mockPayments));
      
      fixture.detectChanges();
      expect(component.isLoading).toBeTrue();
      
      tick();
      fixture.detectChanges();
      
      expect(authService.getCurrentUserId).toHaveBeenCalled();
      expect(paymentService.getPaymentsByParent).toHaveBeenCalledWith(mockUser.id);
      component.payments$?.subscribe(payments => {
        expect(payments).toEqual(mockPayments);
      });
      tick();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
    }));

    it('should not load payment history if user is not authenticated', fakeAsync(() => {
      authService.getCurrentUserId.and.returnValue(null);

      fixture.detectChanges();
      expect(component.isLoading).toBeTrue();
      tick();
      fixture.detectChanges();
      
      expect(authService.getCurrentUserId).toHaveBeenCalled();
      expect(paymentService.getPaymentsByParent).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('User ID not found for payment history');
      component.payments$?.subscribe(payments => {
        expect(payments.length).toBe(0);
      });
      tick();
    }));

    it('should handle error when loading payment history', fakeAsync(() => {
      paymentService.getPaymentsByParent.and.returnValue(throwError(() => new Error('API Error')));
      
      fixture.detectChanges();
      expect(component.isLoading).toBeTrue();
      tick();
      fixture.detectChanges();
      
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe("Erreur lors du chargement de l'historique des paiements.");
      component.payments$?.subscribe(payments => {
        expect(payments.length).toBe(0);
      });
      tick();
    }));
  });

  describe('getPaymentStatusClass', () => {
    it('should return correct class for "succeeded" status', () => {
      expect(component.getPaymentStatusClass(mockPayment1)).toBe('status-row-succeeded');
    });

    it('should return correct class for "pending" status', () => {
      expect(component.getPaymentStatusClass(mockPayment2)).toBe('status-row-pending');
    });

    it('should return empty string for payment without status', () => {
      const paymentWithoutStatus: Payment = { ...mockPayment1, status: undefined as any };
      expect(component.getPaymentStatusClass(paymentWithoutStatus)).toBe('');
    });
  });

  describe('downloadReceipt', () => {
    it('should call paymentService.downloadReceipt and trigger download', fakeAsync(() => {
      const mockBlob = new Blob(['receipt content'], { type: 'application/pdf' });
      paymentService.downloadReceipt.and.returnValue(of(mockBlob));
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:http://localhost/mock-url');
      spyOn(window.URL, 'revokeObjectURL');
      const link = jasmine.createSpyObj('a', ['click', 'setAttribute', 'removeAttribute']);
      spyOn(document, 'createElement').and.returnValue(link);

      component.downloadReceipt('1');
      tick();
      fixture.detectChanges();
      
      expect(paymentService.downloadReceipt).toHaveBeenCalledWith('1');
      expect(link.href).toBe('blob:http://localhost/mock-url');
      expect(link.download).toBe('recu_1.pdf');
      expect(link.click).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-url');
      expect(component.error).toBeNull();
    }));

    it('should handle error when downloadReceipt fails', fakeAsync(() => {
      paymentService.downloadReceipt.and.returnValue(throwError(() => new Error('Download Error')));

      component.downloadReceipt('1');
      tick();
      fixture.detectChanges();
      
      expect(paymentService.downloadReceipt).toHaveBeenCalledWith('1');
      expect(component.error).toBe('Impossible de télécharger le reçu.');
    }));
  });

  it('should set isLoading to true when ngOnInit is called and false when completed successfully', fakeAsync(() => {
    paymentService.getPaymentsByParent.and.returnValue(of(mockPayments));
    
    fixture.detectChanges();
    expect(component.isLoading).toBeTrue();

    tick();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.error).toBeNull();
  }));

  it('should set isLoading to true when ngOnInit is called and false when it errors', fakeAsync(() => {
    paymentService.getPaymentsByParent.and.returnValue(throwError(() => new Error('API Error')));
    
    fixture.detectChanges();
    expect(component.isLoading).toBeTrue();

    tick();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.error).toBe("Erreur lors du chargement de l'historique des paiements.");
  }));
  
  it('should set isLoading to true when ngOnInit is called and false if user not found', fakeAsync(() => {
    authService.getCurrentUserId.and.returnValue(null);
    
    fixture.detectChanges();
    expect(component.isLoading).toBeTrue();

    tick();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.error).toBe('User ID not found for payment history');
  }));
});

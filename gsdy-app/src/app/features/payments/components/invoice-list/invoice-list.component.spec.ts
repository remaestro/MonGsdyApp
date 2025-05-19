import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';

import { InvoiceListComponent } from './invoice-list.component';
import { InvoiceService } from '../../services/invoice.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Invoice, InvoiceItem, InvoiceStatus } from '../../models/invoice.model';
import { User } from '../../../../core/models/user.model';

// Register French locale data
registerLocaleData(localeFr);

describe('InvoiceListComponent', () => {
  let component: InvoiceListComponent;
  let fixture: ComponentFixture<InvoiceListComponent>;
  let mockInvoiceService: jasmine.SpyObj<InvoiceService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser: User = { id: 'user1', name: 'Test User', email: 'test@example.com', role: 'parent' };
  const mockInvoices: Invoice[] = [
    {
      id: 'inv1',
      amount: 100,
      description: 'Test Invoice 1',
      dueDate: new Date(),
      status: 'pending',
      items: [],
      parentId: 'user1',
      createdAt: new Date()
    },
    {
      id: 'inv2',
      amount: 200,
      description: 'Test Invoice 2',
      dueDate: new Date(),
      status: 'paid',
      items: [],
      parentId: 'user1',
      createdAt: new Date(Date.now() - 86400000) // Yesterday
    }
  ];

  beforeEach(async () => {
    mockInvoiceService = jasmine.createSpyObj('InvoiceService', ['getInvoicesByParent']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);

    await TestBed.configureTestingModule({
      imports: [
        InvoiceListComponent, // Ajouter aux imports car c'est un composant autonome
        HttpClientTestingModule,
        RouterTestingModule, 
        CommonModule
      ],
      providers: [
        { provide: InvoiceService, useValue: mockInvoiceService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: LOCALE_ID, useValue: 'fr' } // Provide French locale
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceListComponent);
    component = fixture.componentInstance;

    // Default mocks
    mockAuthService.getCurrentUserId.and.returnValue(mockUser.id);
    mockInvoiceService.getInvoicesByParent.and.returnValue(of(mockInvoices));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load invoices for the current user if authenticated', fakeAsync(() => {
      component.ngOnInit();
      tick(); // Resolve observables
      fixture.detectChanges();

      expect(mockAuthService.getCurrentUserId).toHaveBeenCalled();
      expect(mockInvoiceService.getInvoicesByParent).toHaveBeenCalledWith(mockUser.id);
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
      
      let invoicesRendered: Invoice[] = [];
      component.invoices$?.subscribe(inv => invoicesRendered = inv);
      expect(invoicesRendered).toEqual(mockInvoices);

      // Check if invoices are rendered in the template
      const invoiceCards = fixture.nativeElement.querySelectorAll('.invoice-card');
      expect(invoiceCards.length).toBe(mockInvoices.length);
    }));

    it('should set error and not load invoices if user is not authenticated', fakeAsync(() => {
      mockAuthService.getCurrentUserId.and.returnValue(null);
      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(mockInvoiceService.getInvoicesByParent).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('ID utilisateur non trouvé. Impossible de charger les factures.');
      let invoicesRendered: Invoice[] = [];
      component.invoices$?.subscribe(inv => invoicesRendered = inv);
      expect(invoicesRendered).toEqual([]);
    }));

    it('should handle error when getInvoicesByParent fails', fakeAsync(() => {
      mockInvoiceService.getInvoicesByParent.and.returnValue(throwError(() => new Error('API Error')));
      component.ngOnInit();
      tick();
      fixture.detectChanges();
      tick(); // Ajout d'un tick supplémentaire

      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('Erreur lors du chargement des factures.');
      let invoicesRendered: Invoice[] = [];
      component.invoices$?.subscribe(inv => invoicesRendered = inv);
      expect(invoicesRendered).toEqual([]);
      
      const errorMessage = fixture.nativeElement.querySelector('.error-message p');
      expect(errorMessage.textContent).toContain('Erreur lors du chargement des factures.');
    }));

    it('should display "no invoices" message when no invoices are returned', fakeAsync(() => {
      mockInvoiceService.getInvoicesByParent.and.returnValue(of([]));
      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
      const invoiceCards = fixture.nativeElement.querySelectorAll('.invoice-card');
      expect(invoiceCards.length).toBe(0);
      
      // Check for the specific message for empty array after loading
      const emptyStateElement = fixture.nativeElement.querySelector('div.empty-state p'); // More specific selector
      expect(emptyStateElement).toBeTruthy();
      expect(emptyStateElement.textContent).toContain('Aucune facture trouvée correspondant à vos critères.');
      
      let invoicesRendered: Invoice[] = [];
      component.invoices$?.subscribe(inv => invoicesRendered = inv);
      expect(invoicesRendered.length).toBe(0);
    }));
  });

  describe('getInvoiceStatusClass', () => {
    it('should return correct class for pending status', () => {
      const invoice: Partial<Invoice> = { status: 'pending' };
      expect(component.getInvoiceStatusClass(invoice as Invoice)).toBe('status-pending');
    });

    it('should return correct class for paid status', () => {
      const invoice: Partial<Invoice> = { status: 'paid' };
      expect(component.getInvoiceStatusClass(invoice as Invoice)).toBe('status-paid');
    });

    it('should return correct class for overdue status', () => {
      const invoice: Partial<Invoice> = { status: 'overdue' };
      expect(component.getInvoiceStatusClass(invoice as Invoice)).toBe('status-overdue');
    });

    it('should return correct class for cancelled status', () => {
      const invoice: Partial<Invoice> = { status: 'cancelled' as InvoiceStatus };
      expect(component.getInvoiceStatusClass(invoice as Invoice)).toBe('status-cancelled');
    });

    it('should return empty string if status is undefined', () => {
      const invoice: Partial<Invoice> = { };
      expect(component.getInvoiceStatusClass(invoice as Invoice)).toBe('');
    });

    it('should return empty string if invoice is undefined', () => {
      expect(component.getInvoiceStatusClass(null as any)).toBe('');
    });
  });
});

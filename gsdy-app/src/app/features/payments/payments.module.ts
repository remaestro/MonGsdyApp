import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Composants
import { PaymentsComponent } from './components/payments.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';

// Services
import { PaymentService } from './services/payment.service';
import { InvoiceService } from './services/invoice.service';

const routes: Routes = [
  { path: '', component: PaymentsComponent },
  { path: 'invoices', component: InvoiceListComponent },
  { path: 'invoice/:id', component: PaymentFormComponent },
  { path: 'invoice/:id/details', component: InvoiceListComponent },
  { path: 'history', component: PaymentHistoryComponent }
];

@NgModule({
  declarations: [
    PaymentsComponent,
    InvoiceListComponent,
    PaymentFormComponent,
    PaymentHistoryComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    PaymentService,
    InvoiceService
  ]
})
export class PaymentsModule { }

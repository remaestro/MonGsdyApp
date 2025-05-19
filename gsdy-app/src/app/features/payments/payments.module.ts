import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsComponent } from './components/payments/payments.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';

@NgModule({
  declarations: [
    PaymentsComponent,
    InvoiceListComponent,
    PaymentFormComponent,
    PaymentHistoryComponent
  ],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class PaymentsModule { }

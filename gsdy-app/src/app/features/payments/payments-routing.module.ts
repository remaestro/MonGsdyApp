import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsComponent } from './components/payments/payments.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentsComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: InvoiceListComponent },
      { path: 'invoice/:id', component: PaymentFormComponent }, // Ou un composant de détail de facture si nécessaire
      { path: 'history', component: PaymentHistoryComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsRoutingModule { }

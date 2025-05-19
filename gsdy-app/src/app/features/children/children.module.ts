import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importer FormsModule
import { RouterModule } from '@angular/router';

import { ChildrenRoutingModule } from './children-routing.module';
import { ChildListComponent } from './components/child-list/child-list.component';
import { ChildProfileComponent } from './components/child-profile/child-profile.component';
import { ChildSelectorComponent } from './components/child-selector/child-selector.component';

// Import SharedModule if you have common pipes, directives, or components used here
// import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ChildListComponent,
    ChildProfileComponent,
    ChildSelectorComponent
  ],
  imports: [
    CommonModule,
    RouterModule, // Important for routerLink, router-outlet
    ChildrenRoutingModule,
    FormsModule, // If child-selector uses ngModel
    // SharedModule // Uncomment if SharedModule is created and needed
  ],
  exports: [
    ChildSelectorComponent // Export if it needs to be used in other modules (e.g., a parent layout component)
  ]
})
export class ChildrenModule { }

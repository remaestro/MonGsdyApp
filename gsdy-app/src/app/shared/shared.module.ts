import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationBadgeComponent } from './components/notification-badge/notification-badge.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';

@NgModule({  declarations: [
    NotificationBadgeComponent,
    LanguageSelectorComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NotificationBadgeComponent,
    LanguageSelectorComponent
  ]
})
export class SharedModule { }

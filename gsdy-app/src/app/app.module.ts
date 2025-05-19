import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // CUSTOM_ELEMENTS_SCHEMA importé
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './shared/components/layout/layout/layout.component';
import { HeaderComponent } from './shared/components/layout/header/header.component';
import { SidebarComponent } from './shared/components/layout/sidebar/sidebar.component';
import { FooterComponent } from './shared/components/layout/footer/footer.component';
import { LoaderComponent } from './shared/components/layout/loader/loader.component';

// Modules de fonctionnalités transversales
import { AuthModule } from './core/auth/auth.module';
import { ErrorHandlingModule } from './core/error-handling/error-handling.module';
import { I18nModule } from './core/i18n/i18n.module';
import { NotificationsModule } from './core/notifications/notifications.module'; // Décommenté ou ajouté
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import BrowserAnimationsModule
import { MessagingModule } from './features/messaging/messaging.module'; // Ajout de l'importation
import { NotificationsModule as FeatureNotificationsModule } from './features/notifications/notifications.module'; // Importation du nouveau module de fonctionnalité

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    AuthModule,
    ErrorHandlingModule,
    I18nModule,
    NotificationsModule, // Ajouté ici
    BrowserAnimationsModule, // Ajouter BrowserAnimationsModule aux imports
    MessagingModule, // Module pour la messagerie
    FeatureNotificationsModule // Ajout du module de notifications de fonctionnalité
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ajouté ici
})
export class AppModule { }

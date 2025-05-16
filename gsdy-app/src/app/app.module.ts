import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ColorPaletteDemoComponent } from './color-palette-demo.component';
import { LayoutComponent } from './shared/components/layout/layout/layout.component';
import { HeaderComponent } from './shared/components/layout/header/header.component';
import { SidebarComponent } from './shared/components/layout/sidebar/sidebar.component';
import { FooterComponent } from './shared/components/layout/footer/footer.component';
import { LoaderComponent } from './shared/components/layout/loader/loader.component';

// Modules de fonctionnalités transversales
import { AuthModule } from './core/auth/auth.module';
import { ErrorHandlingModule } from './core/error-handling/error-handling.module';
import { I18nModule } from './core/i18n/i18n.module';
import { NotificationsModule } from './core/notifications/notifications.module';

@NgModule({
  declarations: [
    AppComponent,
    ColorPaletteDemoComponent,
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
    AuthModule,
    ErrorHandlingModule,
    I18nModule,
    NotificationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

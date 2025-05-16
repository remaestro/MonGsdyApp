import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AccessDeniedPageComponent } from './components/access-denied-page/access-denied-page.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';
import { ServerErrorPageComponent } from './components/server-error-page/server-error-page.component';
import { ErrorInterceptor } from './interceptors/error-interceptor';
import { ErrorHandlingService } from './services/error-handling.service';

@NgModule({
  declarations: [
    AccessDeniedPageComponent,
    NotFoundPageComponent,
    ServerErrorPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  providers: [
    ErrorHandlingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  exports: [
    AccessDeniedPageComponent,
    NotFoundPageComponent,
    ServerErrorPageComponent
  ]
})
export class ErrorHandlingModule { }

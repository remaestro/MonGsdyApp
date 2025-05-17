import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentsComponent } from './components/documents/documents.component';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component';
import { SignatureModalComponent } from './components/signature-modal/signature-modal.component';


@NgModule({
  declarations: [
    DocumentsComponent,
    DocumentViewerComponent,
    SignatureModalComponent
  ],
  imports: [
    CommonModule,
    DocumentsRoutingModule
  ]
})
export class DocumentsModule { }

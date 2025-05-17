import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsComponent } from './components/documents/documents.component';
import { DocumentViewerComponent } from './components/document-viewer/document-viewer.component'; // Assurez-vous que le chemin est correct

const routes: Routes = [
  { path: '', component: DocumentsComponent },
  { path: ':documentId', component: DocumentViewerComponent } // Route pour afficher un document spécifique
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule { }

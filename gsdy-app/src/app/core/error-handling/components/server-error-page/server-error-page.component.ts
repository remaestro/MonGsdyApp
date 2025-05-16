import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-server-error-page',
  templateUrl: './server-error-page.component.html',
  styleUrls: ['./server-error-page.component.css']
})
export class ServerErrorPageComponent implements OnInit {
  errorDetails: any = null;
  showTechnicalDetails = false;
  
  constructor(private route: ActivatedRoute) { }
  
  ngOnInit(): void {
    // Récupérer les détails de l'erreur des paramètres de route (si disponibles)
    this.route.queryParams.subscribe(params => {
      if (params['errorDetails']) {
        try {
          this.errorDetails = JSON.parse(params['errorDetails']);
        } catch (e) {
          console.error('Impossible de parser les détails de l\'erreur:', e);
          this.errorDetails = { message: 'Détails d\'erreur non disponibles' };
        }
      } else {
        this.errorDetails = { message: 'Erreur serveur générique' };
      }
    });
  }
  
  /**
   * Rafraîchir la page
   */
  reloadPage(): void {
    window.location.reload();
  }
  
  /**
   * Afficher/masquer les détails techniques
   */
  toggleTechnicalDetails(): void {
    this.showTechnicalDetails = !this.showTechnicalDetails;
  }
}

import { Component, OnInit } from '@angular/core';
import { ToastService } from './core/notifications/services/toast.service';
import { TranslationService } from './core/i18n/services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'gsdy-app';
  
  constructor(
    private toastService: ToastService,
    private translationService: TranslationService
  ) {}
  
  ngOnInit() {
    // Démonstration des notifications après chargement de l'application
    setTimeout(() => {
      this.toastService.success('Application chargée avec succès !');
      
      // Démonstration des différents types de notifications
      setTimeout(() => this.toastService.info('Ceci est une notification d\'information'), 2000);
      setTimeout(() => this.toastService.warning('Ceci est un avertissement'), 4000);
      setTimeout(() => this.toastService.error('Ceci est une erreur'), 6000);
    }, 1000);
  }
}

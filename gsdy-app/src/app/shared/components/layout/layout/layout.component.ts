import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  sidebarVisible = false;

  constructor() { }

  ngOnInit(): void {
    // Détecter la taille de l'écran pour le sidebar au démarrage
    this.checkScreenSize();
    
    // Écouter les changements de taille d'écran
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  /**
   * Vérifier la taille de l'écran et adapter l'affichage du sidebar
   */
  checkScreenSize(): void {
    // Sur desktop (md et plus), afficher le sidebar par défaut
    this.sidebarVisible = window.innerWidth >= 768;
  }

  /**
   * Basculer la visibilité du sidebar (principalement pour mobile)
   */
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  /**
   * Nettoyage lors de la destruction du composant
   */
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }
}

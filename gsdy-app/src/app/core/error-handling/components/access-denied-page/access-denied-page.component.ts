import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-access-denied-page',
  templateUrl: './access-denied-page.component.html',
  styleUrls: ['./access-denied-page.component.css']
})
export class AccessDeniedPageComponent {

  constructor(private location: Location) { }
  
  /**
   * Retourner à la page précédente
   */
  goBack(): void {
    this.location.back();
  }
}

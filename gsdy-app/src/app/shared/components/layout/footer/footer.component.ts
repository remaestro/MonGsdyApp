import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  @Input() appVersion: string = '1.0.0'; // À injecter depuis le composant parent
  currentYear: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
    // Aucune logique spéciale nécessaire pour l'instant
  }
}

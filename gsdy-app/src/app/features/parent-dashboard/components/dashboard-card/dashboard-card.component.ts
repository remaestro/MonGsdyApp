import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css']
})
export class DashboardCardComponent implements OnInit {
  // @Input() title: string = ''; // Titre de la carte, peut être passé en propriété
  // @Input() iconClass: string = ''; // Classe pour une icône optionnelle

  constructor() { }

  ngOnInit(): void {
  }

}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Child } from '../models/child.model';

@Injectable({
  providedIn: 'root'
})
export class ChildrenService {

  // Mock data for now
  private mockChildren: Child[] = [
    {
      id: '1',
      firstName: 'Léo',
      lastName: 'Dupont',
      class: 'CM1 A',
      birthDate: new Date(2015, 5, 15),
      photo: 'assets/images/children/leo.jpg'
    },
    {
      id: '2',
      firstName: 'Mia',
      lastName: 'Dupont',
      class: 'CP B',
      birthDate: new Date(2017, 8, 22),
      photo: 'assets/images/children/mia.jpg'
    }
  ];

  constructor() { }

  getChildren(): Observable<Child[]> {
    return of(this.mockChildren);
  }

  getChildById(id: string): Observable<Child | undefined> {
    return of(this.mockChildren.find(child => child.id === id));
  }

  // TODO: Implement methods for updating child information if needed in this phase
  // TODO: Implement method to get/set active child for other modules
}

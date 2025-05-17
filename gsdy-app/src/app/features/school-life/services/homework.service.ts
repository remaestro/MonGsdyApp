import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Homework } from '../models/homework.model';

@Injectable({
  providedIn: 'root' // Ou dans un module spécifique si préféré
})
export class HomeworkService {

  private mockHomeworks: Homework[] = [
    {
      id: 'hw1',
      childId: '1', // Léo Dupont
      subject: 'Mathématiques',
      title: 'Exercices sur les fractions',
      description: 'Faire les exercices 1 à 5 page 42 du manuel.',
      dueDate: new Date('2025-05-20'),
      assignedDate: new Date('2025-05-17'),
      isCompleted: false
    },
    {
      id: 'hw2',
      childId: '1',
      subject: 'Français',
      title: 'Lire le chapitre 3 du livre "Le Petit Prince"',
      dueDate: new Date('2025-05-22'),
      assignedDate: new Date('2025-05-17'),
      isCompleted: true
    },
    {
      id: 'hw3',
      childId: '2', // Mia Dupont
      subject: 'Découverte du monde',
      title: 'Dessiner un animal de la ferme',
      description: 'Utiliser des crayons de couleur.',
      dueDate: new Date('2025-05-19'),
      assignedDate: new Date('2025-05-17'),
      isCompleted: false
    }
  ];

  constructor() { }

  getHomeworkForChild(childId: string): Observable<Homework[]> {
    return of(this.mockHomeworks.filter(hw => hw.childId === childId));
  }

  // TODO: Ajouter des méthodes pour marquer comme complété, etc.
}

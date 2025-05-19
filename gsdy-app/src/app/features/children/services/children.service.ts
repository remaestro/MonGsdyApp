import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Child } from '../models/child.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChildrenService {
  private apiUrl = '/api/children';

  private childrenSubject = new BehaviorSubject<Child[]>([]);
  children$ = this.childrenSubject.asObservable();

  private selectedChildSubject = new BehaviorSubject<Child | null>(null);
  selectedChild$ = this.selectedChildSubject.asObservable();

  private mockChildren: Child[] = [
    { id: 'child1', parentId: 'parent1', firstName: 'Alice', lastName: 'Dupont', dateOfBirth: new Date('2018-05-10'), classId: 'CP1', photoUrl: 'assets/images/child1.jpg', gender: 'female' },
    { id: 'child2', parentId: 'parent1', firstName: 'Bob', lastName: 'Dupont', dateOfBirth: new Date('2020-09-15'), classId: 'MS', photoUrl: 'assets/images/child2.jpg', gender: 'male' },
    { id: 'child3', parentId: 'parent2', firstName: 'Charlie', lastName: 'Martin', dateOfBirth: new Date('2019-01-20'), classId: 'GS', photoUrl: 'assets/images/child3.jpg', gender: 'male' },
  ];

  constructor(private http: HttpClient, private authService: AuthService) { }

  loadChildrenForCurrentUser(): Observable<Child[]> {
    const parentId = this.authService.getCurrentUserId();
    if (!parentId) {
      console.error('ChildrenService: Parent ID not found, cannot load children.');
      this.childrenSubject.next([]);
      return of([]);
    }
    return of(this.mockChildren.filter(child => child.parentId === parentId)).pipe(
      tap(children => {
        this.childrenSubject.next(children);
        if (children.length > 0 && !this.selectedChildSubject.value) {
          // this.setSelectedChild(children[0]);
        }
      }),
      catchError(error => {
        console.error('Error loading children:', error);
        this.childrenSubject.next([]);
        return throwError(() => new Error('Failed to load children'));
      })
    );
  }

  getAllChildren(): Observable<Child[]> {
    return of(this.mockChildren).pipe(
      tap(children => this.childrenSubject.next(children)),
      catchError(error => {
        console.error('Error loading all children:', error);
        this.childrenSubject.next([]);
        return throwError(() => new Error('Failed to load all children'));
      })
    );
  }

  getChildrenByParentId(parentId: string): Observable<Child[]> {
    return of(this.mockChildren.filter(child => child.parentId === parentId)).pipe(
      tap(children => {
      }),
      catchError(error => {
        console.error(`Error loading children for parent ${parentId}:`, error);
        return throwError(() => new Error(`Failed to load children for parent ${parentId}`));
      })
    );
  }

  getChildById(id: string): Observable<Child | undefined> {
    return this.children$.pipe(
      map(children => children.find(child => child.id === id)),
      catchError(error => {
        console.error(`Error loading child ${id}:`, error);
        return of(undefined);
      })
    );
  }

  setSelectedChild(child: Child | null | string): void {
    if (typeof child === 'string') {
      this.getChildById(child).subscribe(foundChild => {
        if (foundChild) {
          this.selectedChildSubject.next(foundChild);
        } else {
          console.warn(`ChildrenService: Child with id ${child} not found when trying to set selected child.`);
          this.selectedChildSubject.next(null);
        }
      });
    } else {
      this.selectedChildSubject.next(child);
    }
  }

  addChild(child: Omit<Child, 'id'>): Observable<Child> {
    const newId = `child${this.mockChildren.length + 1}`;
    const parentId = this.authService.getCurrentUserId();
    if (!parentId) {
      return throwError(() => new Error('Parent ID not found, cannot add child.'));
    }
    const newChild: Child = { ...child, id: newId, parentId };
    this.mockChildren.push(newChild);
    this.loadChildrenForCurrentUser().subscribe();
    return of(newChild);
  }

  updateChild(child: Child): Observable<Child> {
    const index = this.mockChildren.findIndex(c => c.id === child.id);
    if (index > -1) {
      this.mockChildren[index] = child;
      this.childrenSubject.next([...this.mockChildren.filter(c => c.parentId === this.authService.getCurrentUserId())]);
      if (this.selectedChildSubject.value?.id === child.id) {
        this.selectedChildSubject.next(child);
      }
      return of(child);
    }
    return throwError(() => new Error('Child not found for update'));
  }

  deleteChild(childId: string): Observable<unknown> {
    this.mockChildren = this.mockChildren.filter(c => c.id !== childId);
    this.childrenSubject.next([...this.mockChildren.filter(c => c.parentId === this.authService.getCurrentUserId())]);
    if (this.selectedChildSubject.value?.id === childId) {
      this.selectedChildSubject.next(null);
    }
    return of({});
  }
}

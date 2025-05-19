import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Child } from '../../models/child.model';
import { ChildrenService } from '../../services/children.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-child-list',
  templateUrl: './child-list.component.html',
  styleUrls: ['./child-list.component.css']
})
export class ChildListComponent implements OnInit {
  children$: Observable<Child[]> | undefined;
  isLoading = true;
  error: string | null = null;

  constructor(
    private childrenService: ChildrenService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.error = null;
    this.childrenService.loadChildrenForCurrentUser().subscribe({
      next: (children) => {
        this.children$ = this.childrenService.children$;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Impossible de charger la liste des enfants.";
        console.error('Error loading children in ChildListComponent', err);
        this.isLoading = false;
      }
    });
  }

  trackByChildId(index: number, child: Child): string {
    return child.id;
  }
}

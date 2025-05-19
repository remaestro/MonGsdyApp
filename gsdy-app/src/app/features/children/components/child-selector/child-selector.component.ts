import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Child } from '../../models/child.model';
import { ChildrenService } from '../../services/children.service';
import { AuthService } from '../../../../core/auth/services/auth.service'; // Importer AuthService

@Component({
  selector: 'app-child-selector',
  templateUrl: './child-selector.component.html',
  styleUrls: ['./child-selector.component.css']
})
export class ChildSelectorComponent implements OnInit, OnDestroy {
  children$: Observable<Child[]> | undefined;
  selectedChildId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private childrenService: ChildrenService,
    private authService: AuthService, // Injecter AuthService
    private router: Router
  ) { }

  ngOnInit(): void {
    // Récupérer l'ID du parent connecté (simulé pour l'instant)
    // Dans une vraie application, vous obtiendrez cela à partir du service d'authentification après la connexion.
    const parentId = this.authService.getCurrentUserId(); // Supposons que cette méthode existe et retourne l'ID de l'utilisateur connecté

    if (parentId) {
      this.children$ = this.childrenService.getChildrenByParentId(parentId).pipe(
        tap(children => {
          // Si aucun enfant n'est sélectionné et qu'il y a des enfants, sélectionner le premier par défaut
          if (!this.selectedChildId && children && children.length > 0) {
            // Ne pas appeler onChildSelect ici pour éviter une boucle si la sélection déclenche une navigation
            // this.selectedChildId = children[0].id;
            // this.childrenService.setSelectedChild(this.selectedChildId);
          }
        })
      );
    } else {
      console.error("Parent ID not found, cannot load children.");
      // Gérer le cas où l'ID du parent n'est pas disponible
    }

    this.childrenService.selectedChild$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(selectedChild => {
      this.selectedChildId = selectedChild ? selectedChild.id : null;
    });
  }

  onChildSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const childId = selectElement.value;
    if (childId) {
      this.childrenService.setSelectedChild(childId);
      // Naviguer vers la page de l'enfant sélectionné, par exemple, le profil ou un tableau de bord
      // Exemple: this.router.navigate(['/features/children/profile', childId]);
      // Ou si la navigation est gérée par les composants parents (Vie Scolaire, Cantine),
      // le simple fait de mettre à jour le service suffira.
      console.log('Selected child ID in ChildSelectorComponent:', childId);
    } else {
      this.childrenService.setSelectedChild(null);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

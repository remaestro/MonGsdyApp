import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Child } from '../../models/child.model';
import { ChildrenService } from '../../services/children.service';
// import { ActiveChildService } from '../../../core/services/active-child.service'; // Предполагаемый сервис

@Component({
  selector: 'app-child-selector',
  templateUrl: './child-selector.component.html',
  styleUrls: ['./child-selector.component.css']
})
export class ChildSelectorComponent implements OnInit, OnDestroy {
  children$: Observable<Child[]> | undefined;
  selectedChildId: string | null = null;
  private destroy$ = new Subject<void>();

  // constructor(private childrenService: ChildrenService, private activeChildService: ActiveChildService) { }
  constructor(private childrenService: ChildrenService) { }

  ngOnInit(): void {
    this.children$ = this.childrenService.getChildren();
    // this.activeChildService.getActiveChildId().pipe(
    //   takeUntil(this.destroy$)
    // ).subscribe(id => {
    //   this.selectedChildId = id;
    // });

    // Mock selection of the first child if available
    this.children$?.pipe(takeUntil(this.destroy$)).subscribe(children => {
      if (children && children.length > 0 && !this.selectedChildId) {
        // this.onChildSelect(children[0].id);
      }
    });
  }

  onChildSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const childId = selectElement.value;
    if (childId) {
      // this.activeChildService.setActiveChildId(childId);
      console.log('Selected child ID:', childId); // Placeholder
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

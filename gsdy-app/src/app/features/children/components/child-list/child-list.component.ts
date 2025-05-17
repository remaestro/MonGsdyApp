import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Child } from '../../models/child.model';
import { ChildrenService } from '../../services/children.service';

@Component({
  selector: 'app-child-list',
  templateUrl: './child-list.component.html',
  styleUrls: ['./child-list.component.css']
})
export class ChildListComponent implements OnInit {
  children$: Observable<Child[]> | undefined;

  constructor(private childrenService: ChildrenService) { }

  ngOnInit(): void {
    this.children$ = this.childrenService.getChildren();
  }

  trackByChildId(index: number, child: Child): string {
    return child.id;
  }
}

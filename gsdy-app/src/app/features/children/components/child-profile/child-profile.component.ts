import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Child } from '../../models/child.model';
import { ChildrenService } from '../../services/children.service';

@Component({
  selector: 'app-child-profile',
  templateUrl: './child-profile.component.html',
  styleUrls: ['./child-profile.component.css']
})
export class ChildProfileComponent implements OnInit {
  child$: Observable<Child | undefined> | undefined;

  constructor(
    private route: ActivatedRoute,
    private childrenService: ChildrenService
  ) { }

  ngOnInit(): void {
    this.child$ = this.route.paramMap.pipe(
      switchMap(params => {
        const childId = params.get('id');
        if (childId) {
          return this.childrenService.getChildById(childId);
        }
        return new Observable<Child | undefined>(); // Ou gérer l'erreur/cas null
      })
    );
  }
}

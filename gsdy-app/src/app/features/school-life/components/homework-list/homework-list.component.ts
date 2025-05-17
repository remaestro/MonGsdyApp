import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Homework } from '../../models/homework.model';
import { HomeworkService } from '../../services/homework.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-homework-list',
  templateUrl: './homework-list.component.html',
  styleUrls: ['./homework-list.component.css']
})
export class HomeworkListComponent implements OnInit {
  homework$!: Observable<Homework[]>;
  childId!: string;

  constructor(
    private route: ActivatedRoute,
    private homeworkService: HomeworkService
  ) { }

  ngOnInit(): void {
    this.homework$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.childId = params.get('childId')!;
        return this.homeworkService.getHomeworkForChild(this.childId);
      })
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  isLoading = false;

  constructor(private loaderService: LoaderService) { }

  ngOnInit(): void {
    // S'abonner à l'état du loader
    this.loaderService.getLoaderState().subscribe(state => {
      this.isLoading = state;
    });
  }
}

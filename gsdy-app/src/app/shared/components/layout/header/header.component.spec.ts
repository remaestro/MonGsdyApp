import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Importer HttpClientTestingModule
import { RouterTestingModule } from '@angular/router/testing'; // Importer RouterTestingModule
import { TranslateModule } from '@ngx-translate/core'; // Importer TranslateModule
import { NO_ERRORS_SCHEMA } from '@angular/core'; // Importer NO_ERRORS_SCHEMA

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [
        HttpClientTestingModule, // Ajouter HttpClientTestingModule
        RouterTestingModule,   // Ajouter RouterTestingModule
        TranslateModule.forRoot() // Ajouter TranslateModule.forRoot()
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ajouter NO_ERRORS_SCHEMA pour les composants enfants potentiels
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureModalComponent } from './signature-modal.component';

describe('SignatureModalComponent', () => {
  let component: SignatureModalComponent;
  let fixture: ComponentFixture<SignatureModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignatureModalComponent]
    });
    fixture = TestBed.createComponent(SignatureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

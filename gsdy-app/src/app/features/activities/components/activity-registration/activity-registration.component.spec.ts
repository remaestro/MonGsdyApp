import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityRegistrationComponent } from './activity-registration.component';

describe('ActivityRegistrationComponent', () => {
  let component: ActivityRegistrationComponent;
  let fixture: ComponentFixture<ActivityRegistrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityRegistrationComponent]
    });
    fixture = TestBed.createComponent(ActivityRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { ErrorInterceptor } from './error-interceptor';

describe('ErrorInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorInterceptor]
    });
  });

  it('should create an instance', () => {
    const interceptor = TestBed.inject(ErrorInterceptor); // Requires TestBed setup
    expect(interceptor).toBeTruthy();
  });
});

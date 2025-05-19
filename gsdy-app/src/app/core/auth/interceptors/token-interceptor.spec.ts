import { TestBed } from '@angular/core/testing';
import { TokenInterceptor } from './token-interceptor';

describe('TokenInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenInterceptor]
    });
  });

  it('should create an instance', () => {
    const interceptor = TestBed.inject(TokenInterceptor);
    expect(interceptor).toBeTruthy();
  });
});

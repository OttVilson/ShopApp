import { TestBed } from '@angular/core/testing';

import { InvalidRouteGuard } from './invalid-route.guard';

describe('InvalidRouteGuard', () => {
  let guard: InvalidRouteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(InvalidRouteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

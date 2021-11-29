import { Overlay } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { environment } from 'src/environments/environment';

import { InvalidRouteGuard } from './invalid-route.guard';

describe('InvalidRouteGuard', () => {
  let guard: InvalidRouteGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        AngularFireModule.initializeApp(environment.firebase)
      ],
      providers: [
        AuthService,
        SpinnerService,
        Overlay
      ]
    });
    guard = TestBed.inject(InvalidRouteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

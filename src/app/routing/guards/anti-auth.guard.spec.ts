import { Overlay } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';

import { AntiAuthGuard } from './anti-auth.guard';

describe('AntiAuthGuard', () => {
  let guard: AntiAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        AngularFireModule.initializeApp(environment.firebase)
      ],
      providers: [
        Overlay
      ]
    });
    guard = TestBed.inject(AntiAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

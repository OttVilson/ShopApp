import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { areUsersEqual } from 'src/app/model/model';
import { ANONYMOUS, AuthService } from 'src/app/services/auth.service';
import { composeLoginRedirect } from './login-redirect';

@Injectable({
  providedIn: 'root'
})
export class InvalidRouteGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<UrlTree> {
    return this.auth.user$.pipe(
      map(user => !areUsersEqual(user, ANONYMOUS) ? this.router.parseUrl('') : composeLoginRedirect(state, this.router))
    )
  }
}
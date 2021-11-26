import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { composeLoginRedirect } from './login-redirect';
import { ANONYMOUS, AuthService } from 'src/app/services/auth.service';
import { areUsersEqual } from 'src/app/model/model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<true | UrlTree> {
      return this.auth.user$.pipe(
        map(user => !areUsersEqual(user, ANONYMOUS) ? true : composeLoginRedirect(state, this.router),
        tap(res => console.log('Auth guard redirect', res))
      ));
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<true | UrlTree> {
    return this.canActivate(route, state);
  }
  
}

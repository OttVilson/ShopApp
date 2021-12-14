import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { areUsersEqual } from 'src/app/model/model';
import { ANONYMOUS, AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AntiAuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<true | UrlTree> {
    return this.auth.user$
      .pipe(
        map(user => !areUsersEqual(user, ANONYMOUS) ? this.router.parseUrl('') : true)
      );
  }
}

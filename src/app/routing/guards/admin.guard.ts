import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { AppUser } from 'src/app/model/model';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {

  constructor(
    private auth: AuthService,
    private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<true | UrlTree> {     
    return this.auth.user$.pipe(
      filter((user: AppUser | undefined): user is AppUser => !!user),
      map(user => user.isAdmin ? true : this.router.parseUrl(''))
    );
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<true | UrlTree> {
    return this.canActivate(route, state);
  }
}

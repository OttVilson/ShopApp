import { Injectable, InjectionToken, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot, Routes, UrlTree } from '@angular/router';
import { EMPTY, forkJoin, from, interval, Observable, of, ReplaySubject, timer } from 'rxjs';
import { concatMap, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { SpinnerService } from './spinner.service';
import { MenuItem, Product } from '../model/model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _menuItems$: ReplaySubject<MenuItem[]> = new ReplaySubject<MenuItem[]>(1);

  constructor(
    private router: Router, 
    private injector: Injector,
    private auth: AuthService
  ) {
    this.initializeMenuItems();
  }
  
  private initializeMenuItems(): void {
    let composedMenu$ = this.composeMenu();
    this.auth.user$.pipe(switchMap(() => composedMenu$))
      .subscribe({
        next: menuItems => this._menuItems$.next(menuItems),
        error: error => console.log(error)
      });
  }

  get menuItems$(): Observable<MenuItem[]> {
    return this._menuItems$.asObservable();
  }

  private composeMenu(): Observable<MenuItem[]> {
    let menuItems: Observable<MenuItem | null>[] = [];

    let routes = this.flattenRoutes(this.router.config);
    routes.filter(route => route.data?.menuItem)
          .forEach(route => menuItems.push(this.getMenuItemIfAccessPermitted(route)));

    return forkJoin(menuItems).pipe(
      map(array => array.filter((el: MenuItem | null): el is MenuItem => el != null))
    );
  }

  private flattenRoutes(routes: Routes): Routes {
    let flattenedRoutes: Routes = [];
    routes.forEach(route => this.processRoute(route, '', flattenedRoutes, []));
    return flattenedRoutes;
  }

  private processRoute(
    route: Route,
    pathPrefix: string,
    flattenedRoutes: Routes, 
    canActivateFromParent: InjectionToken<CanActivate>[]
  ): void {
    let path = this.getPath(route, pathPrefix);

    if (route.component) this.addRoute(route, path, flattenedRoutes, canActivateFromParent);

    if (route.children) {
      route.children.forEach(
        child => this.processRoute(child, path, flattenedRoutes, 
                            this.getCanActivateForChild(route, canActivateFromParent))
      );
    }
  }

  private getPath(route: Route, pathPrefix: string): string {
    return pathPrefix + (route.path ? '/' + route.path : '');
  }

  private addRoute(
    route: Route, 
    path: string, 
    flattenedRoutes: Routes, 
    canActivateFromParent: InjectionToken<CanActivate>[]
  ): void {
    route.data = route.data || {};
    route.data.path = path;
    route.data.canActivateForMenu = route.data.canActivateForMenu || 
      this.getCanActivateForSelf(route, canActivateFromParent); 
    flattenedRoutes.push(route);
  }

  private getCanActivateForSelf(
    route: Route, 
    canActivateFromParent: InjectionToken<CanActivate>[]
  ): InjectionToken<CanActivate>[] {
    let canActivateSelf: InjectionToken<CanActivate>[] = route.canActivate || [];
    return [...canActivateFromParent, ...canActivateSelf];
  }

  private getCanActivateForChild(
    route: Route,
    canActivateFromParent: InjectionToken<CanActivate>[]
  ): InjectionToken<CanActivate>[] {
    let canActivateChild: InjectionToken<CanActivate>[] = route.canActivateChild || [];
    let canActivateSelf: InjectionToken<CanActivate>[] = route.canActivate || [];
    return [...canActivateFromParent, ...canActivateSelf, ...canActivateChild];
  }

  private getMenuItemIfAccessPermitted(route: Route): Observable<MenuItem | null> {
    let canActivateForMenu = route.data?.canActivateForMenu || [];
    
    if (canActivateForMenu.length == 0) {
      return of(this.extractMenuItem(route));
    } else {
      let {routeSnapshot, stateSnapshot} = this.prepareStuntParams(route.path || '');

      // https://stackoverflow.com/questions/40589878/multiple-canactivate-guards-all-run-when-first-fails/63955377#63955377
      return from<InjectionToken<CanActivate>[]>(canActivateForMenu)
              .pipe(
                concatMap(guardToken => this.getGuardResponse(guardToken, routeSnapshot, stateSnapshot)),
                first(res => res !== true, true),
                map(res => res === true ? this.extractMenuItem(route) : null)
              );
    }
  }

  private prepareStuntParams(path: string): { routeSnapshot: ActivatedRouteSnapshot, stateSnapshot: RouterStateSnapshot} {
    let routeSnapshot = new ActivatedRouteSnapshot();
    routeSnapshot.url = this.router.parseUrl(path).root.segments;   
    let stateSnapshot = {} as RouterStateSnapshot;
    stateSnapshot.url = path; 

    return { routeSnapshot, stateSnapshot };    
  }

  private getGuardResponse(
    guardToken: InjectionToken<CanActivate>,
    routeSnapshot: ActivatedRouteSnapshot,
    stateSnapshot: RouterStateSnapshot
  ): Observable<true | UrlTree> {
    let guard = this.injector.get<CanActivate>(guardToken)
    return (guard.canActivate(routeSnapshot, stateSnapshot) as Observable<true | UrlTree>)
            .pipe(first());
  }

  private extractMenuItem(route: Route): MenuItem | null {
    if (!route.data?.menuItem) return null;

    let menuItem = route.data.menuItem;
    menuItem.link = route.data.path;
    
    return menuItem;
  }
}
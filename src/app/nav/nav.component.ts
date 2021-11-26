import { Component } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { EMPTY, Observable } from 'rxjs';
import { ANONYMOUS, AuthService } from '../services/auth.service';
import { MenuService } from '../services/menu.service';
import { MenuItem, AppUser, LoginProvider } from '../model/model';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  menuItems$: Observable<MenuItem[]> = EMPTY;
  user$: Observable<AppUser> = EMPTY;

  constructor(
    menuService: MenuService,
    auth: AuthService
  ) {
    this.menuItems$ = menuService.menuItems$;
    this.user$ = auth.user$;
  }

  icon(matMenuTrigger: MatMenuTrigger) {
    if (matMenuTrigger.menuOpen)
      return 'keyboard_arrow_up';
    else  
      return 'keyboard_arrow_down';
  }
}
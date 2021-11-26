import { Component, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, Event } from '@angular/router';
import { SpinnerService } from './services/spinner.service';
import { concatMap, delay, filter, map, switchMap, tap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { DatabaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    router: Router, 
  ) {
    router.events.pipe(
      map((event: Event) => this.checkRouterEvent(event)),
      filter((res: boolean | void): res is boolean => typeof res === 'boolean')
    ).subscribe(
    //  res => res ? spinner.startSpinner() : spinner.stopSpinner() 
    );
  }

  checkRouterEvent(event: Event): boolean | void {
    if (event instanceof NavigationStart)
      return true;

    if (event instanceof NavigationEnd ||
        event instanceof NavigationCancel || 
        event instanceof NavigationError)
      return false;
  }

  ngOnInit() {
    // this.test$.subscribe(
    //   res => console.log(res)
    // )

    // setTimeout(
    //   () => this.spinner.spin$.next(true),
    //   2000
    // );

    // setTimeout(
    //   () => this.spinner.spin$.next(false),
    //   7000
    // );
  }
}

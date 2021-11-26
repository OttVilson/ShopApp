// https://medium.com/@velenra/using-angular-material-spinner-with-cdk-overlay-8ab92bfbafee
// https://newbedev.com/loading-indication-with-a-delay-and-anti-flickering-in-rxjs
// https://medium.com/angularwave/rxjs-challenge-17-non-flicker-loader-15545d3be525
// https://stackoverflow.com/questions/45132579/rxjs-observable-stretch

import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatSpinner } from '@angular/material/progress-spinner';
import { combineLatest, from, merge, Observable, of, ReplaySubject, Subject, timer, UnaryFunction } from 'rxjs';
import { catchError, delay, distinct, distinctUntilChanged, filter, first, map, mapTo, mergeMap, pairwise, scan, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  
  private overlayRef: OverlayRef;
  private overlayConfig: OverlayConfig = {
    hasBackdrop: true,
    positionStrategy: this.overlay.position()
    .global().centerHorizontally().centerVertically()
  };

  private spin$: Subject<boolean> = new Subject();
  private lag: number = 200;
  private antiFlickeringBuffer = 500;
  
  private spinnerTimeline: (Partial<SpinnerState> & { delay: number})[] = [
    { delay: 0 },
    { isSpinning: true,  proposeStop: false,  delay: this.lag },
    { isSpinning: true,  proposeStop: true, delay: this.lag + this.antiFlickeringBuffer }
  ];
  private delayStartAndPreventFlickering$ = from(this.spinnerTimeline).pipe(
    mergeMap(item => of(item).pipe(delay(item.delay)))
  );

  constructor(private overlay: Overlay) {
    this.overlayRef = overlay.create(this.overlayConfig);
    this.initializeSpinner();
  }
  
  private initializeSpinner(): void {
    this.spin$.asObservable().pipe(
      catchError(error => {
        console.log(error);
        return of(false);
      }),
      map(res => res ? +1 : -1),
      scan((acc, value) => acc + value >= 0 ? acc + value : 0, 0),
    )
    .subscribe({
      next: res => this.regulateSpinner(res, this.overlayRef),
      error: (error: any) => {
        console.log(error);
        this.regulateSpinner(0, this.overlayRef);
      }
    });
  }

  serviceInitializationSpinner<T>(data$: ReplaySubject<T>): void {
    merge(
      data$.pipe(
        first(),
        mapTo<T, Partial<SpinnerState>>({ proposeStop: true })
      ),
      this.delayStartAndPreventFlickering$
    ).pipe(
      pairwise(),
      map(([previous, current]) => this.combinePair(previous, current)),
      takeWhile(spinnerState => spinnerState.isSpinning),
      map(spinnerState => !spinnerState.proposeStop),
      distinctUntilChanged()
    ).subscribe(start => this.spin$.next(start))
  }

  // https://stackoverflow.com/questions/22767602/in-javascript-why-does-undefined-true-return-undefined
  private combinePair(previous: Partial<SpinnerState>, current: Partial<SpinnerState>): SpinnerState {
    return { 
      isSpinning: previous.isSpinning || current.isSpinning || false, 
      proposeStop: (previous.proposeStop || false) && (current.proposeStop || false)
    }
  }

  private regulateSpinner(res: number, overlayRef: OverlayRef) {
    if (res === 1 && !overlayRef.hasAttached())
      overlayRef.attach(new ComponentPortal(MatSpinner));
    else if (res === 0 && overlayRef.hasAttached())
      overlayRef.detach();
  }
}

interface SpinnerState {
  isSpinning: boolean,
  proposeStop: boolean
}
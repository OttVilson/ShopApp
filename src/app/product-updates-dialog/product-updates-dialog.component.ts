import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, concat, EMPTY, Observable, of, ReplaySubject, timer } from 'rxjs';
import { auditTime, debounceTime, delay, delayWhen, distinctUntilChanged, first, map, mapTo, share, startWith, switchMap, tap, throttle } from 'rxjs/operators';
import { FormObjectDiff } from '../helpers/form.helpers';

@Component({
  selector: 'app-product-updates-dialog',
  templateUrl: './product-updates-dialog.component.html',
  styleUrls: ['./product-updates-dialog.component.css']
})
export class ProductUpdatesDialogComponent implements OnInit{

  form: FormGroup;
  diffs$: Observable<FormObjectDiff[]> = EMPTY;
  private input$: ReplaySubject<FormObjectDiff[]>;
  private diffs: FormObjectDiff[] = [];
  counter: number = 0;

  state$: Observable<{ all: boolean, some: boolean }> = EMPTY;
  buttonMessage$: Observable<string> = EMPTY.pipe(startWith('Close'));

  constructor(
    private snackBar: MatSnackBar 
  ) {
    this.form = this.initializedForm([]);
    this.input$ = new ReplaySubject<FormObjectDiff[]>(1);
  }
  
  ngOnInit() {
    this.diffs$ = this.input$.pipe(
      tap(() => this.operateSnackBar()),
      tap(diffs => {
        this.form = this.initializedForm(diffs, this.form);
        this.diffs = diffs;
        this.state$ = this.initializedState(this.form);
        this.buttonMessage$ = this.initializedButtonMessage(this.state$);
      }),
      // https://github.com/reactivex/rxjs/issues/5357
      // without this delay it seems that form initialization and HTML formControlNames 
      // are accessed simultaneously, and some formControlNames are not found
      delay(0)
    );
  }

  addDiffs(diffArray: FormObjectDiff[]) {
    this.input$.next(diffArray);
  }

  chosenDiffs(): FormObjectDiff[] {
    return this.diffs.filter(this.isDiffChosen);
  }

  setAllValues(chosen: boolean) {
    Object.values(this.form.controls).forEach(control => control.setValue(chosen));
  }

  tooltip(diff: FormObjectDiff): string {
    return `The value of the field ${diff.path[0]} has not been changed in the current edit page.`;
  }

  private isDiffChosen = (diff: FormObjectDiff): boolean => {
    return this.form.value[diff.path[0]];
  }

  private initializedForm(diffs: FormObjectDiff[], previousForm?: FormGroup): FormGroup {
    let form = new FormGroup({});
    diffs.forEach(diff => form.addControl(diff.path[0] as string, this.initializedFormControl(diff, previousForm)))

    return form;
  }

  private initializedFormControl(diff: FormObjectDiff, previousForm?: FormGroup): FormControl {
    const previousControl: FormControl | null = previousForm ? previousForm.get(diff.path) as FormControl : null;
    const value: boolean = previousControl ? previousControl.value : diff.pristine;
    const control = new FormControl(value);
    return control;
  }

  private operateSnackBar() {
    this.counter++;
    if (this.counter > 1)
      this.snackBar.open('New updates', undefined, { duration: 2500, verticalPosition: 'top' });
  }

  private initializedState(form: FormGroup): Observable<{ all: boolean, some: boolean }> {
    const formControls: FormControl[] = Object.values(form.controls) as FormControl[];
    const observables = formControls.map(control => this.valueChangeObservableEmittingOnSubscribe(control));
    return combineLatest(observables).pipe(
              auditTime(50),
              map(controlsValues => this.produceState(controlsValues)),
              distinctUntilChanged()
            );
  }
            
  private produceState(controlsValues: boolean[]): { all: boolean, some: boolean } {
    return {      
      all: controlsValues.every(value => value),
      some: controlsValues.some(value => value) && controlsValues.some(value => !value)
    };
  }
 
  private valueChangeObservableEmittingOnSubscribe(control: FormControl): Observable<boolean> {
    return of(control).pipe(
      switchMap(control => concat(
        of(control.value),
        control.valueChanges
      ))
    ); 
  }

  private initializedButtonMessage(state$: Observable<{ all: boolean, some: boolean}>): Observable<string> {
    return state$.pipe(
      map(state => {
        let message = 'Ignore all differences';
        if (state.all)
          message = 'Merge all differences';
        else if (state.some)
          message = 'Merge chosen differences' 
        return message;
      }),
      startWith('Close')
    );
  }
}
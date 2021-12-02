import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, EMPTY, Observable, ReplaySubject } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { FormObjectDiff } from '../helpers/form.helpers';

@Component({
  selector: 'app-product-updates-dialog',
  templateUrl: './product-updates-dialog.component.html',
  styleUrls: ['./product-updates-dialog.component.css']
})
export class ProductUpdatesDialogComponent {

  form: FormGroup;
  private input$: BehaviorSubject<FormObjectDiff[]>;
  diff$: Observable<FormObjectDiff[]> = EMPTY;

  constructor(
    public dialogRef: MatDialogRef<ProductUpdatesDialogComponent>,
    private fb: FormBuilder 
  ) {
    this.form = fb.group({});
    this.input$ = new BehaviorSubject<FormObjectDiff[]>([]);
    this.diff$ = this.input$.pipe(
      tap(diffArray => {
        this.form = this.fb.group({});
        diffArray.forEach(diff => this.form.addControl(diff.path[0] as string, new FormControl(true)));
      }),
      delay(2000)
    );
  }

  addDiff(diffArray: FormObjectDiff[]) {
    this.input$.next(diffArray);
  }

  onClick() {
    console.log(this.form.value);
  }

  chosenDiffs(): FormObjectDiff[] {
    return this.input$.getValue().filter(diff => this.form.value[diff.path[0]]);
  }
}

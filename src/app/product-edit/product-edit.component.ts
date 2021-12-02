import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, of, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith, switchMap, tap } from 'rxjs/operators';
import { FormObjectDiff as FormObjectDiff, leftDiffBetweenFormAndObject } from '../helpers/form.helpers';
import { Product } from '../model/model';
import { ProductUpdatesDialogComponent } from '../product-updates-dialog/product-updates-dialog.component';
import { DatabaseService } from '../services/database.service';
import { SpinnerService } from '../services/spinner.service';
import { StoreComponent } from '../store/store.component';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy {

  form: FormGroup;
  ID = 'product-updates-dialog';
  DIALOG_CONFIGURATION = {
    width: '400px',
    height: '400px',
    id: this.ID,
    disableClose: true
  };
  subscription: Subscription = EMPTY.subscribe();

  constructor(
    private route: ActivatedRoute,
    private dbService: DatabaseService,
    private router: Router,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) { this.form = this.initializeForm(fb); }

  ngOnInit() {
    this.subscription = this.route.queryParamMap.pipe(
      map(res => res.get('id')),
      switchMap(id => this.getPartialProduct(id)),
      map(product => leftDiffBetweenFormAndObject(this.form, product)),
      switchMap(product => this.dialogObservable(product))
    )
    .subscribe(diffArray => this.updateForm(diffArray))  
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private initializeForm(fb: FormBuilder): FormGroup {
    return fb.group({
      title: [, Validators.required ],
      price: [, Validators.required ],
      category: [, Validators.required ],
      imageURL: [, Validators.required ],
      id: []
    }); 
  }

  private getPartialProduct(id: string | null): Observable<Partial<Product>> {
    if (id)
      return this.dbService.getProduct(id).pipe(
        map(product => {
          if (product) return product;
          
          this.router.navigate(['admin', 'products', 'edit'])
          return {};
        })  
      );

    return of({});
  }

  dialogObservable(diffArray: FormObjectDiff[]): Observable<FormObjectDiff[]> {
    if (!diffArray.length) return of(diffArray);
    // let idDiff = diffArray.find(diff => diff.path[0] === 'id');
    // if (idDiff) return of(diffArray);

    let dialogRef: MatDialogRef<ProductUpdatesDialogComponent, Partial<Product>> = 
      this.dialog.getDialogById(this.ID) ||
      this.dialog.open(ProductUpdatesDialogComponent, this.DIALOG_CONFIGURATION);

    dialogRef.componentInstance.addDiff(diffArray);

    return dialogRef.afterClosed() as Observable<FormObjectDiff[]>;
  }

  private updateForm(diffArray: FormObjectDiff[]): void {
    diffArray.forEach(diff => {
      let formControl = this.form.get(diff.path)!;
      formControl.setValue(diff.objectValue);
      formControl.markAsPristine();
      formControl.markAsTouched();
    });
  }

  get title() {
    return this.form.get('title');
  }

  onClick() {
    console.log(this.title);
  }

  onClickForm() {
    console.log(this.form);
  }


  setNull() {
    this.title?.patchValue(null);
    this.title?.markAsPristine();
    this.title?.markAsUntouched();
  }
}
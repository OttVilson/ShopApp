import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FormObjectDiff as FormObjectDiff, leftDiffBetweenFormAndObject } from '../helpers/form.helpers';
import { Product } from '../model/model';
import { ProductUpdatesDialogComponent } from '../product-updates-dialog/product-updates-dialog.component';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit, OnDestroy {

  form: FormGroup;
  ID = 'product-updates-dialog';
  DIALOG_CONFIGURATION: MatDialogConfig = {
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
    fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { this.form = this.initializeForm(fb); }

  ngOnInit() {
    this.subscription = this.route.queryParamMap.pipe(
      map(res => res.get('id')),
      switchMap(id => this.getPartialProduct(id)),
      map(product => leftDiffBetweenFormAndObject(this.form, product)),
      switchMap(diffArray => this.dialogObservable(diffArray))
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
      imageCredit: [],
      id: []
    }); 
  }

  private getPartialProduct(id: string | null): Observable<Partial<Product>> {
    this.form.reset();
    
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

  private dialogObservable(diffArray: FormObjectDiff[]): Observable<FormObjectDiff[]> {
    if (!diffArray.length) return this.closeDialogAndReturnEmptyDiffsArray();
    
    const idDiff = diffArray.find(diff => diff.path[0] === 'id');
    if (idDiff) return this.returnInitialProduct(idDiff, diffArray); 

    return this.openDialogAndReturnItsResult(diffArray);
  }

  private closeDialogAndReturnEmptyDiffsArray() {
    this.dialog.getDialogById(this.ID)?.close([]);  
    return of([]);
  }

  private returnInitialProduct(idDiff: FormObjectDiff, diffArray: FormObjectDiff[]): Observable<FormObjectDiff[]> {
      if (idDiff.objectValue) {
        this.completeDiffsArray(diffArray);
        return of(diffArray);
      } else {
        return of([idDiff]);
      }
  }

  private openDialogAndReturnItsResult(diffArray: FormObjectDiff[]): Observable<FormObjectDiff[]> {
    const dialogRef: MatDialogRef<ProductUpdatesDialogComponent, FormObjectDiff[]> = 
    this.dialog.getDialogById(this.ID) ||
    this.dialog.open(ProductUpdatesDialogComponent, this.DIALOG_CONFIGURATION);

    dialogRef.componentInstance.addDiffs(diffArray);

    return dialogRef.afterClosed() as Observable<FormObjectDiff[]>;
  }

  private updateForm(diffArray: FormObjectDiff[]): void {
    diffArray.forEach(diff => {
      let formControl = this.form.get(diff.path)!;
      formControl.setValue(diff.objectValue);
      formControl.markAsPristine();
      formControl.markAsTouched();
    });
  };

  private completeDiffsArray(diffArray: FormObjectDiff[]): void {
    Object.keys(this.form.controls).forEach(
      control => {
        if (!diffArray.some(diff => diff.path[0] === control))
          diffArray.push({ path: [control], pristine: true, formValue: undefined, objectValue: undefined });
      }
    );
  }

  onCancel() {
    this.router.navigate(['admin', 'products']);
  }

  onSave(product: Product) {
    if (product.id === undefined) {
      this.dbService.add(product).then(
        id => {
          this.snackBar.open('Adding new product was successful', undefined, { duration: 2000 }); 
          this.router.navigate(['admin', 'products', 'edit'], { queryParams: { id }})
        }
      );
    } else {
      this.dbService.update(product).then(
        () => this.snackBar.open('Update was successful', undefined, { duration: 2000 })
      );
    }
  }
}
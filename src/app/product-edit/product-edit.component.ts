import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { filter, map, pairwise, startWith, switchMap, tap } from 'rxjs/operators';
import { Product } from '../model/model';
import { DatabaseService } from '../services/database.service';
import { SpinnerService } from '../services/spinner.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {

  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private dbService: DatabaseService,
    private router: Router,
    private spinner: SpinnerService,
    fb: FormBuilder
  ) { this.form = this.initializeForm(fb); }

  ngOnInit() {
    this.route.queryParamMap.pipe(
      map(res => res.get('id')),
      switchMap(id => this.getMap(id)),
      // filter(res => window.confirm('Let pass?')),
      tap(console.log),
      tap(res => console.log(Object.keys(this.form.controls))),
      tap(res => console.log(this.form.value as Partial<Product>)),
      tap(product => {
        // this.form.reset(product);
      })
    )
    .subscribe(
      product => {
        // this.form.get('title')!.setValue(product?.title);
        // this.form.get('price')!.setValue(product?.price);
        // this.form.get('category')!.setValue(product?.category);
        // this.form.get('imageURL')!.setValue(product?.imageURL);
      }
    )  
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

  private getMap(id: string | null): Observable<Partial<Product>> {
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

  private diff(first: Partial<Product>, second: Partial<Product>): Partial<Product> {
    Object.keys(this.form.controls).forEach  
    
    return {};
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
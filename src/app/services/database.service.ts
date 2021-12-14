import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';
import { areProductsEqual, Product } from '../model/model';
import { delay, distinctUntilChanged, map, tap } from 'rxjs/operators';

type ProductData = Omit<Product, 'id'>

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  products$: Observable<Product[]> = EMPTY;
  private PRODUCTS: string = 'products' as const;

  constructor(private store: AngularFirestore) {
    this.products$ = this.getObservable(this.store.collection<ProductData>(this.PRODUCTS));
  }
  
  private getObservable(collection: AngularFirestoreCollection<ProductData>): Observable<Product[]> {
    let replaySubject = new ReplaySubject<Product[]>(1);
    collection.valueChanges({ idField: 'id'}).subscribe(res => replaySubject.next(res));
    return replaySubject.asObservable();
  }

  getProduct(id: string): Observable<Product | undefined> {
    return this.products$.pipe(
      map(products => products.find(product => product.id === id)),
      distinctUntilChanged(areProductsEqual)
    );
  }
  
  add(product: Product): Promise<string> {    
    let {id, ...productData} = {...product};
    return this.store.collection<ProductData>(this.PRODUCTS).add(productData).then(res => res.id);
  }

  update(product: Partial<Product> & { id: string }): Promise<void> {
    let {id, ...productData} = {...product};
    this.checkId(id);

    return this.store.collection<ProductData>(this.PRODUCTS).doc(id).update(productData);
  }

  delete(product: Product): void {
    let {id, ...productData} = {...product};
    this.checkId(id);

    this.store.collection<ProductData>(this.PRODUCTS).doc(id).delete()
      .catch(err => console.log(err));
  }

  private checkId(id: string) {
    if (!id) throw new Error('Product\'s id must be non-empty string.');
  }
}
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { Product } from '../model/model';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {

  products$: Observable<Product[]>;
  displayedColumns: string[] = ['title', 'price', 'actions'];

  constructor(
    private dbService: DatabaseService, 
    private router: Router
  ) {
    this.products$ = dbService.products$;
  }

  onEdit(product: Product) {
    this.router.navigate(['admin', 'products', 'edit'], { queryParams: { id: product.id }});
  }

  onDelete(product: Product) {
    this.dbService.delete(product);
  }

  onAdd() {
    this.router.navigate(['admin', 'products', 'edit']);
  }
}
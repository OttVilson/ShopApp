import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from '../model/model';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements AfterViewInit {

  products$: Observable<Product[]>;
  displayedColumns: string[] = ['title', 'price', 'actions'];

  constructor(
    private dbService: DatabaseService, 
    private router: Router
  ) {
    this.products$ = dbService.products$;
  }

  @ViewChild('matSort') sort!: MatSort;

  ngAfterViewInit() {
    setTimeout(
      () => console.log(this.sort),
      5000
    )
    // this.sort.sortChange.asObservable().subscribe(
    //   res => console.log('sort', res)
    // )
  }

  announceSortChange(sortState: Sort) {
    console.log(sortState);
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
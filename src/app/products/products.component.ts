import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Product, productStunt } from '../model/model';
import { DatabaseService } from '../services/database.service';
import { CustomDataSource } from '../helpers/custom-data-source';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements AfterViewInit {

  dataSource: CustomDataSource<Product>;
  displayedColumns: string[] = ['title', 'price', 'actions'];
  filter: FormControl = new FormControl();

  constructor(
    private dbService: DatabaseService, 
    private router: Router
  ) {
    this.dataSource = new CustomDataSource(dbService.products$, productStunt, ['title', 'price'], word => word);
  }

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.setSort(this.sort);
    this.dataSource.setFilter(this.filter);
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
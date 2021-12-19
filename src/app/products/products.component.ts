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
import { MatPaginator } from '@angular/material/paginator';
import { CurrencyPipe } from '@angular/common';

interface ProductColumn {
  columnDef: keyof Product, 
  header: string, 
  cell: (product: Product) => string
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements AfterViewInit {

  dataSource: CustomDataSource<Product>;
  filter: FormControl = new FormControl();
  
  COLUMNS: ProductColumn[] = [
    {
      columnDef: 'title',
      header: 'Title',
      cell: (product: Product) => `${product.title}`
    }, {
      columnDef: 'price',
      header: 'Price',
      cell: (product: Product) => `${this.currency.transform(product.price)}`
    }
  ];
  displayedColumns: string[] = [...this.getColumnDefs(this.COLUMNS), 'actions'];

  constructor(
    private dbService: DatabaseService, 
    private router: Router,
    private currency: CurrencyPipe
  ) {
    this.dataSource = new CustomDataSource(dbService.products$, productStunt, this.getColumnDefs(this.COLUMNS));
  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.setSort(this.sort);
    this.dataSource.setFilter(this.filter);
    this.dataSource.setPaginator(this.paginator);
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

  private getColumnDefs(columns: ProductColumn[]): (keyof Product)[] {
    return columns.map(product => product.columnDef);
  }
}
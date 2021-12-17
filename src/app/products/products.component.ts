import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Product } from '../model/model';
import { DatabaseService } from '../services/database.service';
import { CustomDataSource } from '../helpers/custom-data-source';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements AfterViewInit {

  dataSource: CustomDataSource<Product>;
  displayedColumns: string[] = ['title', 'price', 'actions'];

  constructor(
    private dbService: DatabaseService, 
    private router: Router
  ) {
    this.dataSource = new CustomDataSource(dbService.products$);
  }


  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.addSort(this.sort);
    let filter = document.getElementById('filter') as HTMLInputElement;
    fromEvent(filter, 'input').subscribe(e => console.log((e.target as HTMLInputElement).value));
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
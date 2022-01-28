import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TableColumn, Product } from '../model/model';
import { DatabaseService } from '../services/database.service';
import { MatPaginator } from '@angular/material/paginator';
import { CurrencyPipe } from '@angular/common';
import { NgxDataSource, NgxDataSourceImpl } from 'ngx-data-source';
import { MaterialSortAndPaginatorConnector } from 'ngx-data-source-material-plugins';
import { ColumnsManipulations, SubsetOfKeys } from './columns';
import { Observable } from 'rxjs';
import { FlatObjectsFilter } from '../helpers/flat-objects-filter';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements AfterViewInit, OnDestroy {
  
  private columnsManipulations!: ColumnsManipulations;
  COLUMNS!: ReadonlyArray<TableColumn<Product>>;
  displayedColumns!: string[];

  dataSource!: NgxDataSource<Product, SubsetOfKeys>;
  private materialConnector!: MaterialSortAndPaginatorConnector<Product, SubsetOfKeys>;
  private searchFilter!: FlatObjectsFilter<Product>;
  filter: FormControl = new FormControl();

  pageSizeOptions = [1, 2, 3, 5, 8, 20];

  constructor(
    private router: Router,
    private dbService: DatabaseService, 
    currency: CurrencyPipe
  ) {
    this.initializeColumns(currency);
    this.initializeDataSource();
  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('upperPaginator') upperPaginator!: MatPaginator;
  @ViewChild('lowerPaginator') lowerPaginator!: MatPaginator;

  ngAfterViewInit() {
    this.materialConnector.addSorts(this.columnsManipulations.getComparators(), this.sort);
    this.materialConnector.addPaginators(this.upperPaginator, this.lowerPaginator);
  }

  ngOnDestroy() {
    this.materialConnector.disconnect();
    this.searchFilter.disconnect();
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

  private initializeColumns(currency: CurrencyPipe): void {
    this.columnsManipulations = new ColumnsManipulations(currency);
    this.COLUMNS = this.columnsManipulations.getColumns();
    this.displayedColumns = [...this.columnsManipulations.getColumnDefs(), 'actions'];
  }

  private initializeDataSource(): void {
    // https://indepth.dev/posts/1193/create-your-standalone-angular-library-in-10-minutes
    this.dataSource = new NgxDataSourceImpl({ pageSize: 3 });
    this.materialConnector = new MaterialSortAndPaginatorConnector(this.dataSource);
    this.dataSource.getInputPlummer().connectDataPipe(this.dbService.products$);
    this.initializeSearchFilter();
  }

  private initializeSearchFilter() {
    this.searchFilter = new FlatObjectsFilter(['title', 'price', 'category']);
    this.searchFilter.setSearchbarInput(this.filter.valueChanges as Observable<string>)
    this.dataSource.getInputPlummer().connectFilterPipe(this.searchFilter.getFilterStream());
  }
}
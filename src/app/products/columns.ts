import { CurrencyPipe } from "@angular/common";
import { Product, TableColumn } from "../model/model";
import { CompareFunctions } from "ngx-data-source-material-plugins";

export const getColumns = (currency: CurrencyPipe) => [
    {
      columnDef: 'title',
      header: 'Title',
      cell: (product: Product) => `${product.title}`,
      compareFunction: (first: Product, second: Product) => 
        first.title < second.title ? -1 : first.title > second.title ? +1 : 0
    }, {
      columnDef: 'price',
      header: 'Price',
      cell: (product: Product) => `${currency.transform(product.price)}`,
      compareFunction: (first: Product, second: Product) => first.price - second.price
    }
] as const;

export type SubsetOfKeys = ReturnType<typeof getColumns>[number]['columnDef'];

export type AColumn = ReturnType<typeof getColumns>[number];

export class ColumnsManipulations {
    private COLUMNS: ReadonlyArray<AColumn>

    constructor(currency: CurrencyPipe) {
        this.COLUMNS = getColumns(currency);
    }

    getColumns(): ReadonlyArray<TableColumn<Product>> {
        return this.COLUMNS;
    }

    getComparators(): CompareFunctions<Product, SubsetOfKeys> {
        let initial: Partial<CompareFunctions<Product, SubsetOfKeys>> = {};
        const compareFunctions = 
          this.COLUMNS.reduce((accumulated, current) => this.addCompareFunction(accumulated, current), initial);
    
        return this.assertType(compareFunctions);
    }

    getColumnDefs(): string[] {
        return this.COLUMNS.map(product => product.columnDef);
    }

    private addCompareFunction(
        accumulated: Partial<CompareFunctions<Product, SubsetOfKeys>>,
        current: AColumn
    ): Partial<CompareFunctions<Product, SubsetOfKeys>> {
        accumulated[current.columnDef] = current.compareFunction
        return accumulated;
    }
    
    private assertType(
        compareFunctions: Partial<CompareFunctions<Product, SubsetOfKeys>>
    ): CompareFunctions<Product, SubsetOfKeys> {
        if (this.ifFullSetOfCompareFunctions(compareFunctions))
          return compareFunctions;
        else
          throw new Error('Despite starting with COLUMNS all entries of the array are still not represented ' + 
            'in the result');
    }
    
    private ifFullSetOfCompareFunctions(
        compareFunctions: Partial<CompareFunctions<Product, SubsetOfKeys>>
    ): compareFunctions is CompareFunctions<Product, SubsetOfKeys> {
        return this.COLUMNS.every(entry => entry.columnDef in compareFunctions)
    }
}
import { MonoTypeOperatorFunction, Observable, pipe, ReplaySubject, Subscription } from "rxjs";
import { Filter } from 'ngx-data-source';
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";

export class FlatObjectsFilter<T extends { [key in keyof T]: string | number | boolean | undefined | null}> {

    private _filterOutput$: ReplaySubject<Filter<T>> = new ReplaySubject(1);
    private _inputSubscription: Subscription | undefined = undefined;

    constructor(private columnsToFilter?: (keyof T)[]) {}

    setSearchbarInput(searchInput$: Observable<string>) {
        this._inputSubscription = this.pipeInput(searchInput$).subscribe(
            normalizedSearchString => this.processOutput(normalizedSearchString)
        );
    }

    getFilterStream() {
        return this._filterOutput$.asObservable();
    }

    disconnect() {
        this._inputSubscription?.unsubscribe();
        this._filterOutput$.complete();
    }

    private pipeInput(searchInput$: Observable<string>): Observable<string> {
        return  searchInput$.pipe(
                    this.smoothFilter(),
                    map(input => this.normalize(input))
                );
    }

    private smoothFilter<T>(): MonoTypeOperatorFunction<T> {
        return  pipe(
                    debounceTime(150),
                    distinctUntilChanged()
                );
    } 

    private normalize(input: string): string {
        return input.toUpperCase();
    }

    private processOutput(normalizedSearchString: string) {
        this._filterOutput$.next(
            element => this.issearchInputContainedInColumnsSubsetOfElement(normalizedSearchString, element)
        );
    }

    private issearchInputContainedInColumnsSubsetOfElement(normalizedSearchString: string, element: T): boolean {
        const checkFromColumns: (keyof T)[] = this.columnsToFilter || this.getColumnsFromElement(element);
        return checkFromColumns.some(column => this.isContainedInColumn(normalizedSearchString, column, element));
    }

    private getColumnsFromElement(element: T) {
        const columns = Object.keys(element);
        return this.assertType(columns, element);
    }

    private isContainedInColumn(normalizedSearchString: string, key: keyof T, element: T): boolean {
        const value = String(element[key]);
        const normalizedValue = this.normalize(value);
        return normalizedValue.includes(normalizedSearchString);
    }

    private assertType(columns: (string | number | symbol)[], element: T): (keyof T)[] {
        if (this.areAllKeysInElement(columns, element))
            return columns
        else throw new Error('Despite using Object keys still some of the columns are not present in element of T');    
    }

    private areAllKeysInElement(columns: (string | number | symbol)[], element: T): columns is (keyof T)[] {
        return columns.every(column => column in element);
    }
}
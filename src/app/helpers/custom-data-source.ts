import { CollectionViewer } from "@angular/cdk/collections";
import { DataSource } from "@angular/cdk/table";
import { CurrencyPipe } from "@angular/common";
import { FormControl } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { BehaviorSubject, combineLatest, merge, Observable, Subscription } from "rxjs";
import { debounceTime, delay, distinctUntilChanged, map, scan, startWith, tap, withLatestFrom } from "rxjs/operators";
import { isKeyOfType } from "../model/model";
import { comparator, DirectedSort, isDirectedSort } from "./sort.helpers";

const columnsToFilterBasedOnStunt = <T>(stunt: Required<T>): (keyof T)[] => {
    let result: (keyof T)[] = [];
    Object.keys(stunt).forEach(
        key => {
            if (isKeyOfType(stunt)(key))
                result.push(key);
        }
    );
    return result;
}

export class CustomDataSource<T> extends DataSource<T> {
    private _dataSubscription: Subscription;
    private _input$ = new BehaviorSubject<T[]>([]);
    
    private _filter$ = new BehaviorSubject<string>('');
    private _filterSubscription: Subscription | null = null;

    private _sort$ = new BehaviorSubject<DirectedSort<T>[]>([]);
    private _sortSubscription: Subscription | null = null;
    
    private _output$ = new BehaviorSubject<T[]>([]);
    private _outputSubscription: Subscription | null = null;

    private _pagination$ = new BehaviorSubject<PageEvent | null>(null);
    private _paginationSubscription: Subscription | null = null;
    private _paginator: MatPaginator | null = null;

    constructor(
        data$: Observable<T[]>, 
        private stunt: Required<T>,
        private columnsToFilter: (keyof T)[] = columnsToFilterBasedOnStunt(stunt),
        private processWord: (word: string) => string = word => word.trim().toUpperCase() 
    ) {
        super();
        this._dataSubscription = data$.subscribe(array => this._input$.next(array));
    }

    connect(): Observable<readonly T[]> {
        this.constructOutput();
        return this._output$.asObservable();
    }

    disconnect(): void {
        this._input$.complete();
        this._dataSubscription.unsubscribe();

        this._output$.complete();
        this._outputSubscription?.unsubscribe();
        
        this._filter$.complete();
        this._filterSubscription?.unsubscribe();

        this._sort$.complete();
        this._sortSubscription?.unsubscribe();

        this._pagination$.complete();
        this._paginationSubscription?.unsubscribe();
    }

    setFilter(filter: FormControl) {
        this._filterSubscription?.unsubscribe();

        this._filterSubscription = (filter.valueChanges as Observable<string>).pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(filter => this._filter$.next(filter))
    }

    setSort(sort: MatSort) {
        this._sortSubscription?.unsubscribe();
    
        this._sortSubscription = sort.sortChange.pipe(
            scan((acc, cur) => this.accumulateSort(acc, cur), [] as DirectedSort<T>[])
        ).subscribe(directedSortArray => this._sort$.next(directedSortArray))
    }

    setPaginator(paginator: MatPaginator) {
        this._paginationSubscription?.unsubscribe();

        this._paginator = paginator;
        this._paginator.length = 100;
        paginator.page.subscribe(console.log);

        // this.initializeStream(paginator);
        // this._paginationSubscription = paginator.page.subscribe(pageEvent => {
        //     this._pagination$.next(pageEvent);
        //     console.log(pageEvent);
        // });
    }

    private constructOutput(): void {
        const sortedAndFilteredData$ = 
            this.initializedSortedAndFilteredData(this._input$, this._filter$, this._sort$); 
        
        this._outputSubscription = combineLatest([sortedAndFilteredData$, this._pagination$]).pipe(
            map(([sortedAndFilteredData, pagination]) => this.paginateData(sortedAndFilteredData, pagination))
        ).subscribe(data => this._output$.next(data));
    }

    private initializedSortedAndFilteredData(
        data$: BehaviorSubject<T[]>, 
        filter$: BehaviorSubject<string>, 
        sort$: BehaviorSubject<DirectedSort<T>[]>
    ): Observable<T[]> {
        const emitFilteredAndSortedDataOnNewDataEvent$ 
            = this.initializedEmitFilteredAndSortedDataOnNewDataEvent(data$, filter$, sort$);
        const emitSortedDataOnFilterEvent$ = 
            this.initializedEmitSortedDataOnFilterEvent(data$, filter$, sort$);
        const emitFilteredDataOnSortEvent$ = 
            this.initializedEmitFilteredDataOnSortEvent(data$, filter$, sort$);
        
        return  merge(
                    emitFilteredAndSortedDataOnNewDataEvent$, 
                    emitSortedDataOnFilterEvent$, 
                    emitFilteredDataOnSortEvent$
                );
    }

    private initializedEmitFilteredAndSortedDataOnNewDataEvent(
        data$: BehaviorSubject<T[]>,
        filter$: BehaviorSubject<string>,
        sort$: BehaviorSubject<DirectedSort<T>[]>
    ): Observable<T[]> {
        return  data$.pipe(
                    delay(0),
                    withLatestFrom(filter$, sort$),
                    map(([data, filter, sortArray]) => this.sort(sortArray, this.filter(filter, data)))
                );
    }

    private initializedEmitSortedDataOnFilterEvent(
        data$: BehaviorSubject<T[]>,
        filter$: BehaviorSubject<string>,
        sort$: BehaviorSubject<DirectedSort<T>[]> 
    ): Observable<T[]> {        
        const emitFullSortedDataOnChange$ = this.initializedEmitFullSortedDataOnChange(data$, sort$);
        return  filter$.pipe(
                    withLatestFrom(emitFullSortedDataOnChange$),
                    map(([filter, sortedData]) => this.filter(filter, sortedData))
                );
    }
        
    private initializedEmitFullSortedDataOnChange(
        data$: BehaviorSubject<T[]>, 
        sort$: BehaviorSubject<DirectedSort<T>[]>
    ): Observable<T[]> {
        return  combineLatest([sort$, data$]).pipe(
                    map(([sortArray, data]) => this.sort(sortArray, data))
                );
    }
                
    private sort(sortArray: DirectedSort<T>[], data: T[]): T[] {
        if (!sortArray.length) return data;
        else return data.slice().sort(comparator(sortArray));
    }
    
    private initializedEmitFilteredDataOnSortEvent(        
        data$: BehaviorSubject<T[]>,
        filter$: BehaviorSubject<string>,
        sort$: BehaviorSubject<DirectedSort<T>[]> 
    ): Observable<T[]> {        
        const emitFilteredDataOnChange$ = this.initializedEmitFilteredDataOnChange(data$, filter$);
        return  sort$.pipe(
                    withLatestFrom(emitFilteredDataOnChange$),
                    map(([sortArray, filteredData]) => this.sort(sortArray, filteredData))
                );
    }

    private initializedEmitFilteredDataOnChange(
        data$: BehaviorSubject<T[]>,
        filter$: BehaviorSubject<string>
    ): Observable<T[]> {
        return  combineLatest([filter$, data$]).pipe(
                    map(([filter, data]) => this.filter(filter, data))
                );
    }            

    private filter(filter: string, data: T[]): T[] {
        if (!filter) return data;
        else {
            filter = this.processWord(filter);
            return data.filter(entry => this.isRelevantEntry(filter, entry));
        }
    }
    
    private isRelevantEntry(filter: string, entry: T): boolean {
        return this.columnsToFilter.some(column => this.processWord(String(entry[column])).includes(filter));
    }

    private accumulateSort(currentlyAccumulated: DirectedSort<T>[], currentSort: Sort): DirectedSort<T>[] {
        let result = currentlyAccumulated.filter(sort => sort.active !== currentSort.active);
        
        if (isDirectedSort<T>(this.stunt)(currentSort))
            result.unshift(currentSort);

        return result;
    }

    private paginateData(data: T[], pagination: PageEvent | null): T[] {
        if (!pagination) return data;
        else if(this.isFullPage(data, pagination)) {
            const start = pagination.pageIndex*pagination.pageSize;
            const end = start + pagination.pageSize;
            return data.slice(start, end);
        } else {
            const pageIndex = !data.length ? 0 : Math.ceil(data.length / pagination.pageSize) - 1;
            this.updatePaginatorIfNeeded(pageIndex, data.length);
            return data.slice(pageIndex * pagination.pageSize); 
        }
    }

    private isFullPage(data: T[], pagination: PageEvent): boolean {
        return (pagination.pageIndex + 1)*pagination.pageSize <= data.length;
    }

    private updatePaginatorIfNeeded(pageIndex: number, length: number): void {
        if (this._paginator) {
            const paginator = this._paginator;
            if (paginator.pageIndex !== pageIndex) paginator.pageIndex = pageIndex
            if (paginator.length !== length) paginator.length = length
         }
    }

    private initializeStream(paginator: MatPaginator) {
        this._pagination$.next({ 
            pageIndex: paginator.pageIndex, 
            pageSize: paginator.pageSize, 
            length: this._input$.getValue().length
        });
    }
}
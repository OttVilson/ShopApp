import { CollectionViewer } from "@angular/cdk/collections";
import { DataSource } from "@angular/cdk/table";
import { FormControl } from "@angular/forms";
import { MatSort, Sort } from "@angular/material/sort";
import { BehaviorSubject, combineLatest, merge, Observable, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, map, scan, startWith, tap, withLatestFrom } from "rxjs/operators";
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

    constructor(
        data$: Observable<T[]>, 
        private stunt: Required<T>,
        private columnsToFilter: (keyof T)[] = columnsToFilterBasedOnStunt(stunt),
        private processWord: (word: string) => string = word => word.trim().toUpperCase() 
    ) {
        super();
        this._dataSubscription = data$.subscribe(array => this._input$.next(array));
    }

    connect(collectionViewer: CollectionViewer): Observable<readonly T[]> {
        this.constructOutput();
        return this._output$.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._input$.complete();
        this._dataSubscription.unsubscribe();

        this._output$.complete();
        this._outputSubscription?.unsubscribe();
        
        this._filter$.complete();
        this._filterSubscription?.unsubscribe();

        this._sort$.complete();
        this._sortSubscription?.unsubscribe();
    }

    setSort(sort: MatSort) {
        this._sortSubscription?.unsubscribe();
    
        this._sortSubscription = sort.sortChange.pipe(
            scan((acc, cur) => this.accumulateSort(acc, cur), [] as DirectedSort<T>[])
        ).subscribe(directedSortArray => this._sort$.next(directedSortArray))
    }

    setFilter(filter: FormControl) {
        this._filterSubscription?.unsubscribe();

        this._filterSubscription = (filter.valueChanges as Observable<string>).pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(filter => this._filter$.next(filter))
    }

    private constructOutput(): void {
        const emitFilteredAndSortedDataOnNewDataEvent$ 
            = this.initializedEmitFilteredAndSortedDataOnNewDataEvent(this._input$, this._filter$, this._sort$);
        const emitSortedDataOnFilterEvent$ = 
            this.initializedEmitSortedDataOnFilterEvent(this._input$, this._filter$, this._sort$);
        const emitFilteredDataOnSortEvent$ = 
            this.initializedEmitFilteredDataOnSortEvent(this._input$, this._filter$, this._sort$);
        
        this._outputSubscription = 
            merge(
                emitFilteredAndSortedDataOnNewDataEvent$.pipe(tap(() => console.log('new data'))), 
                emitSortedDataOnFilterEvent$.pipe(tap(() => console.log('filter event'))), 
                emitFilteredDataOnSortEvent$.pipe(tap(() => console.log('sort event')))
            ).subscribe(data => this._output$.next(data));
    }

    private initializedEmitFilteredAndSortedDataOnNewDataEvent(
        data$: Observable<T[]>,
        filter$: Observable<string>,
        sort$: Observable<DirectedSort<T>[]>
    ): Observable<T[]> {
        return  data$.pipe(
                    withLatestFrom(filter$, sort$),
                    map(([data, filter, sortArray]) => this.sort(sortArray, this.filter(filter, data)))
                );
    }

    private initializedEmitSortedDataOnFilterEvent(
        data$: Observable<T[]>,
        filter$: Observable<string>,
        sort$: Observable<DirectedSort<T>[]> 
    ): Observable<T[]> {        
        const emitFullSortedDataOnChange$ = this.initializedEmitFullSortedDataOnChange(data$, sort$);
        return  filter$.pipe(
                    withLatestFrom(emitFullSortedDataOnChange$),
                    map(([filter, sortedData]) => this.filter(filter, sortedData))
                );
    }
        
    private initializedEmitFullSortedDataOnChange(
        data$: Observable<T[]>, 
        sort$: Observable<DirectedSort<T>[]>
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
        data$: Observable<T[]>,
        filter$: Observable<string>,
        sort$: Observable<DirectedSort<T>[]> 
    ): Observable<T[]> {        
        const emitFilteredDataOnChange$ = this.initializedEmitFilteredDataOnChange(data$, filter$);
        return  sort$.pipe(
                    withLatestFrom(emitFilteredDataOnChange$),
                    map(([sortArray, filteredData]) => this.sort(sortArray, filteredData))
                );
    }

    private initializedEmitFilteredDataOnChange(
        data$: Observable<T[]>,
        filter$: Observable<string>
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
}
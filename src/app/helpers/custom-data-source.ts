import { CollectionViewer } from "@angular/cdk/collections";
import { DataSource } from "@angular/cdk/table";
import { MatSort, Sort } from "@angular/material/sort";
import { BehaviorSubject, combineLatest, Observable, Subscription } from "rxjs";
import { map, scan, startWith, tap } from "rxjs/operators";
import { comparator, DirectedSort, isDirectedSort, Product } from "../model/model";

export class CustomDataSource<T> extends DataSource<T> {

    private _dataSubscription: Subscription;

    private _input$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
    private _inputSubscription: Subscription;   
    private _output$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);

    

    private _sort: MatSort | null = null;

    constructor(data$: Observable<T[]>) {
        super();
        this._dataSubscription = data$.subscribe(array => this._input$.next(array));
        this._inputSubscription = this._input$.asObservable().subscribe(
            array => this._output$.next(array)
        );
    }

    connect(collectionViewer: CollectionViewer): Observable<readonly T[]> {
        return this._output$.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataSubscription.unsubscribe();
        this._input$.complete();
        this._output$.complete();
    }

    addSort(sort: MatSort) {
        this._sort = sort;

        this._sort.initialized.subscribe(() => console.log('sort initialized.'));

        this._inputSubscription.unsubscribe();
        this._inputSubscription = combineLatest([
            this._input$,
            this._sort.sortChange.asObservable().pipe(startWith({} as Sort), scan((acc, cur) => this.accumulateSort(acc, cur), [] as DirectedSort[]))
        ]).pipe(
            tap(console.log),
            map(res => [...res[0]].sort(comparator(res[1])))
        ).subscribe(
            array => this._output$.next(array)
        );
    }

    private accumulateSort(currentlyAccumulated: DirectedSort[], currentSort: Sort): DirectedSort[] {
        let result = currentlyAccumulated.filter(sort => sort.active !== currentSort.active);
        
        if (isDirectedSort(currentSort))
            result.unshift(currentSort);

        return result;
    }

}
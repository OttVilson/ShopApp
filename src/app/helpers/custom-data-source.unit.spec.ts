import { asyncScheduler } from "rxjs";
import { delay, throttleTime, withLatestFrom } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";

fdescribe('Custom data source', () => {
    let scheduler: TestScheduler;

    beforeEach(() => {
        scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    })

    it('should be fun', () => {
        scheduler.run(({expectObservable, cold, hot}) => {
            let filter$ = hot('--a--b--c');
            let data$ = hot('--1--2--3');
            
            data$.pipe(
                delay(0),
                withLatestFrom(filter$)
            ).subscribe(res => console.log('data -> filter', res));

            filter$.pipe(
                withLatestFrom(data$)
            ).subscribe(res => console.log('filter -> data', res));
            });
        });
})
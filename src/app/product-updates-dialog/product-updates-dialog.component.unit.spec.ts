import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { FormObjectDiff } from "../helpers/form.helpers";
import { ProductUpdatesDialogComponent } from "./product-updates-dialog.component";
import { TestScheduler } from 'rxjs/testing';
import { auditTime, delayWhen, filter, map, startWith, tap, throttleTime } from "rxjs/operators";
import { asyncScheduler, EMPTY, from, Observable, ReplaySubject, timer } from "rxjs";

class MockSnackBar {
    open(message: string, action?: string | undefined, config?: MatSnackBarConfig<any> | undefined) {}
}

fdescribe('Product updates dialog unit tests', () => {
describe('common flow with up to one set of updates', () => {
    let component: ProductUpdatesDialogComponent;
    let diffs: FormObjectDiff[];

    // defaults
    let formValue = 'formValue';
    let objectValue = 'objectValue';
    let pristine = true;
    let path = ['first'];

    // marbles
    // https://kevinkreuzer.medium.com/marble-testing-with-rxjs-testing-utils-3ae36ac3346a
    // https://github.com/jisaacks/RxJS/blob/master/doc/writing-marble-tests.md
    let scheduler: TestScheduler;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: MatSnackBar, useClass: MockSnackBar },
                ProductUpdatesDialogComponent
            ]
        });
        component = TestBed.inject(ProductUpdatesDialogComponent);
        component.ngOnInit();

        scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    });
    
    it('should have public methods ready before inserting any data via addDiff, but after OnInit, ' +
        'i.e., none should return an error', () => {
        const diff: FormObjectDiff = { path, pristine, formValue, objectValue };

        expect(() => component.chosenDiffs()).not.toThrowError();
        expect(() => component.setAllValues(true)).not.toThrowError();
        expect(() => component.tooltip(diff)).not.toThrowError();
        expect(() => component.addDiffs([])).not.toThrowError();
    });

    it('should be ready to return synchronously an array from chosenDiffs right after OnInit, ' + 
        'as this will guarantee that the dialog can be closed also if no data is provided via addDiff', () => {
        const diffs: FormObjectDiff[] = component.chosenDiffs();
        expect(diffs).toEqual([]);
    });

    it('should emit the diffs array provided via addDiff from the observable diffs$ ' +
        'when the observable is subscribed before the invocation of addDiff', () => {
        diffs = [{ path, pristine, formValue, objectValue }];
        
        scheduler.run(({expectObservable, cold}) => {
            const expectedMarble = '              50ms 50ms a';
            const subscriptionBeforeInvocation = '50ms ^';
            
            const expectedResults = { a: diffs };
            const conductor = cold(expectedMarble, expectedResults);
            
            conductor.subscribe(diffs => component.addDiffs(diffs));
            expectObservable(component.diffs$, subscriptionBeforeInvocation).toBe(expectedMarble, expectedResults);
        });
    });

    it('should emit the diffs array provided via addDiff from the observable diffs$' +
        'when the observable is subscribed after the invocation of addDiff', () => {
        diffs = [{ path, pristine, formValue, objectValue }];

        scheduler.run(({expectObservable, cold}) => {
            const expectedResults = { a: diffs };
            
            const expectedMarble = '             50ms 50ms a';
            const conductor = cold('             50ms a', expectedResults);
            const subscriptionAfterInvocation = '50ms 50ms ^';

            conductor.subscribe(diffs => component.addDiffs(diffs));
            expectObservable(component.diffs$, subscriptionAfterInvocation).toBe(expectedMarble, expectedResults);
        });
    });

    it('should initialize the form group with (only) form controls as children ' +
    'based on an array of diffs provided via addDiff, if there is a subsription on diffs$', () => {
        diffs = [{ path, pristine, formValue, objectValue }];
        
        let controls = component.form.controls;
        expect(Object.values(controls).length).toEqual(0);
        
        component.diffs$.subscribe();
        
        controls = component.form.controls;
        expect(Object.values(controls).length).toEqual(0);
        
        component.addDiffs(diffs);        
        
        controls = component.form.controls;
        expect(Object.values(controls).length).toEqual(diffs.length);
        expect(controls[diffs[0].path[0]]).toBeInstanceOf(FormControl);
    });

    it('should have the initialized form control values depend on the property pristine of the diff objects; ' +
        'the values should match for the first diffs array (stay tuned for multiple updates)', () => {
        diffs = [
            { path: ['pristine-true'], pristine: true, formValue, objectValue },
            { path: ['pristine-false'], pristine: false, formValue, objectValue }
        ];
        
        component.diffs$.subscribe();
        component.addDiffs(diffs);

        for (let i = 0; i < diffs.length; i++) {
            let formValue = component.form.get(diffs[i].path)?.value;
            let pristiness = diffs[i].pristine; 
            expect(formValue).toEqual(pristiness);
        }
    });

    it('should change all form values to true when setAllValues is called with argument true regardless of the current values', () => {
        diffs = [
            { path: ['pristine-false'], pristine: false, formValue, objectValue },
            { path: ['pristine-true'], pristine: true, formValue, objectValue }
        ];

        component.diffs$.subscribe();
        component.addDiffs(diffs);
        component.setAllValues(true);
        
        let allValuesReduced = Object.values(component.form.value).every(value => value);
        expect(allValuesReduced).toBeTrue();
    });

    it('should change all form values to false when set AllValues is called with argument false regardless of the current values', () => {
        diffs = [
            { path: ['first'], pristine: false, formValue, objectValue},
            { path: ['second'], pristine: true, formValue, objectValue},
            { path: ['third'], pristine: true, formValue, objectValue},
        ];

        component.addDiffs(diffs);
        component.diffs$.subscribe();
        component.setAllValues(false);

        let allValuesReduced = Object.values(component.form.value).some(value => value);
        expect(allValuesReduced).toBeFalse();
    });

    xit('should emit state object after 50ms if the observable diffs$ has subscription, and a diffs array' +
        ' is provided via addDiff', () => {
        diffs = [];// [{ path, pristine, formValue, objectValue }];

        scheduler.run(({expectObservable, cold}) => {    

            component.diffs$.subscribe();
            let expectedMarble = '75ms |';
            let expectedResults = { b: { all: true, some: false }};

            let conductor = cold('50ms a', { a: diffs });
            conductor.subscribe(diffs => component.addDiffs(diffs));

            cold('65ms a').subscribe(
                () => component.state$.subscribe(res => console.log('subsi sees', res))
            );
            

            expectObservable(component.state$, '75ms ^').toBe(expectedMarble, expectedResults);
        });
        // component.diffs$.subscribe();
        
        // console.log('start', Date.now());
        // component.state$.subscribe(
        //     res => {
        //         expect(res).toEqual({ all: true, some: false });
        //         console.log('stop', Date.now());
        //         done();
        //     }
        // );
        // component.addDiffs(diffs);
            
        expect(true).toBeTruthy();
    });

    it('should be fun', () => {
        scheduler.run(({expectObservable, cold}) => {
            let source$ = cold('--0--------1------------------2--------------3---4---------');
            let expected =     '--------------1---------------------------2--------------4-';
            let time =                                                      '------------|'
            const t = 12;
            expectObservable(source$.pipe(throttleTime(t, asyncScheduler, { leading: false, trailing: true }))).toBe(expected);
        
            const e1 = cold(' --0--1-----2--3----4--5-6---7------------8-------9--------|');
            const exp =      '--0-----------3----4-----------7---------8-----------9----|';
            expectObservable(e1.pipe(
                throttleTime(t, asyncScheduler, { leading: true, trailing: true })
            )).toBe(exp);
        });
    });
});

describe('multiple updates', () => {
    let component: ProductUpdatesDialogComponent;
    let snackBar: MatSnackBar;
    let diffs: FormObjectDiff[];

    let scheduler: TestScheduler;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: MatSnackBar, useClass: MockSnackBar },
                ProductUpdatesDialogComponent
            ]
        });

        component = TestBed.inject(ProductUpdatesDialogComponent);
        component.ngOnInit();

        scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    });

    const eventTimesTen = (source$: Observable<number>) => {
        return source$.pipe(
            filter(n => n % 2 === 0),
            map(n => n*10)
        );
    };

    it('should filter out odd numbers and multiply even numbers by 10', () => {
        scheduler.run(({cold, expectObservable}) => {
            const values = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
            const source$ = cold('a-b-c-d-e-f-g-h-i-j|', values);
            const expectedMarble = '--a---b---c---d---e|';
            const expectedValues = {a: 20, b: 40, c: 60, d: 80, e: 100};

            const results$ = eventTimesTen(source$);
            expectObservable(results$).toBe(expectedMarble, expectedValues);
        });
    });

    it('should increase counter by one for each diffs array provided via addDiff, ' +
        'if there is a subscription on diffs$', () => {
        diffs = [];
        component.diffs$.subscribe();
        expect(component.counter).toEqual(0);
        
        component.addDiffs(diffs);
        expect(component.counter).toEqual(1);

        component.addDiffs(diffs);
        expect(component.counter).toEqual(2);
    });

});
});
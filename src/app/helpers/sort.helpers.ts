import { Sort } from "@angular/material/sort";

export interface DirectedSort<T> extends Sort { 
    direction: 'asc' | 'desc', 
    active: keyof T & string 
}; 

export const isDirectedSort = <T>(stunt: Required<T>) => <T>(sort: Sort): sort is DirectedSort<T> => {
  return !!sort.direction && sort.active in stunt;
}

export const comparator = <T>(sortOrder: DirectedSort<T>[]) => (first: T, second: T): number => {
    const tieBreakingComparator = sortOrder.find(sort => compare(sort, first, second) !== 0);
    
    if (tieBreakingComparator)
        return compare(tieBreakingComparator, first, second);
    else return 0;
}

const compare = <T>(sort: DirectedSort<T>, first: T, second: T): number => {
    const key = sort.active;
    const firstValue = first[key];
    const secondValue = second[key];
    return comparePrimitiveValues(firstValue, secondValue) * directionMultiplier(sort);
}

const comparePrimitiveValues = <T>(first: T[keyof T], second: T[keyof T]): number => {
    // Assuming that field values are primitives or null.
    let result = 0;
    if (first == undefined) {
        if (second != undefined)
            result = -1;
    } else if (second == undefined) {
        result = +1;
    } else if (first < second) {
        result = -1;
    } else if (second < first) {
        result = +1;
    }

    return result;
}

const directionMultiplier= <T>(sort: DirectedSort<T>): number => {
    return sort.direction === 'asc' ? +1 : -1;
}
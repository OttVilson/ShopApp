import { Sort } from "@angular/material/sort";

const isKeyOfType = <T>(stunt: Required<T>) => (key: string | number | symbol): key is keyof T => {
  return key in stunt;
}

function areEqualBasedOnStunt<T>(stunt: Required<T>, first: T, second: T): boolean {
  const isKeyOfT = isKeyOfType(stunt);

  return Object.keys(stunt).every(key => {
    if (isKeyOfT(key))
      return first[key] === second[key]
    else return true;
  })
}

export interface Product {
    title: string,
    price: number,
    category: string,
    imageURL: string,
    imageCredit?: string,
    id: string
}

const productStunt: Required<Product> = {
  title: '',
  price: 0,
  category: '',
  imageURL: '',
  imageCredit: '',
  id: ''
}

export const areProductsEqual = (first: Product | undefined, second: Product | undefined) => {
  if (first === second) return true;
  if (first === undefined || second === undefined) return false;

  const areEqual = (first: Product, second: Product) => areEqualBasedOnStunt(productStunt, first, second);
  return areEqual(first, second);
}

export type DirectedSort = Sort & { direction: 'asc' | 'desc'}

export const isDirectedSort = (sort: Sort): sort is DirectedSort => {
  return !!sort.direction;
}

export const comparator = (sortOrder: DirectedSort[]) => (first: Product, second: Product): number => {
  const tieBreakingComparator = sortOrder.find(sort => compare(sort, first, second) !== 0);
  
  if (tieBreakingComparator)
      return compare(tieBreakingComparator, first, second);
  else return 0;
}

function compare(sort: DirectedSort, first: Product, second: Product): number {
  const key = sort.active;
  if (isKeyOfType(productStunt)(key)) {
      const firstValue = first[key];
      const secondValue = second[key];
      return compareValues(firstValue, secondValue) * directionMultiplier(sort);
  } else 
      return 0;
}

function compareValues(first: string | number | undefined, second: string | number | undefined): number {
  if (first === second)
      return 0;
  else if (typeof first === 'undefined')
      return -1;
  else if (typeof second === 'undefined')
      return +1;
  else
      return first < second ? -1 : +1;
}

function directionMultiplier(sort: DirectedSort): number {
  return sort.direction === 'asc' ? +1 : -1;
}

export enum LoginProvider {
  GOOGLE = 'google.com',
  GITHUB = 'github.com'
}

export interface AppUser {
  uuid: string,
  name: string,
  photoURL?: string,
  icon?: string,
  isAdmin?: boolean,
  loginProvider: LoginProvider
}

const appUserStunt: Required<AppUser> = {
  uuid: '',
  name: '',
  photoURL: '',
  icon: '',
  isAdmin: false,
  loginProvider: LoginProvider.GOOGLE
}

export const areUsersEqual = (first: AppUser, second: AppUser): boolean => {
  const areEqual = (first: AppUser, second: AppUser) => areEqualBasedOnStunt(appUserStunt, first, second);
  return areEqual(first, second);
}

export interface MenuItem {
  text: string,
  link: string,
  icon?: string,
  shortcut?: boolean
}
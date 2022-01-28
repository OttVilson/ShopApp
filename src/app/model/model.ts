// generics

import { CompareFunction } from "ngx-data-source";

export const isKeyOfType = <T>(stunt: Required<T>) => (key: string | number | symbol): key is keyof T => {
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

export interface TableColumn<T> {
  columnDef: string, 
  header: string, 
  cell: (product: T) => string,
  compareFunction: CompareFunction<T>
}

// Product

export interface Product {
    title: string,
    price: number,
    category: string,
    imageURL: string,
    imageCredit?: string,
    id: string
}

export const productStunt: Required<Product> = {
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

// AppUser

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

// MenuItem

export interface MenuItem {
  text: string,
  link: string,
  icon?: string,
  shortcut?: boolean
}
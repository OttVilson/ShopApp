
export interface Product {
    title: string,
    price: number,
    category: string,
    imageURL: string,
    imageCredit?: string,
    id: string
}

export const areProductsEqual = (first: Product | undefined, second: Product | undefined) => {
  if (first === undefined || second === undefined)
    return first === second;

  return first.title    === second.title &&
         first.price    === second.price &&
         first.category === second.category &&
         first.imageURL === second.imageURL &&
         first.imageCredit === second.imageCredit &&
         first.id       === second.id;
}

export interface AppUser {
  uuid: string,
  name: string,
  photoURL?: string,
  icon?: string,
  isAdmin?: boolean,
  loginProvider: LoginProvider
}
  
export const areUsersEqual = (first: AppUser, second: AppUser): boolean => {
  return first.uuid          === second.uuid &&
         first.name          === second.name &&
         first.photoURL      === second.photoURL &&
         first.icon          === second.icon &&
         first.isAdmin       === second.isAdmin &&
         first.loginProvider === second.loginProvider;
}

export enum LoginProvider {
  GOOGLE = 'google.com',
  GITHUB = 'github.com'
}

export interface MenuItem {
  text: string,
  link: string,
  icon?: string,
  shortcut?: boolean
}
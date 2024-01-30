import { Role } from './models/role';
import { Store } from './models/store';

export declare module '@medusajs/medusa/dist/models/store' {
  declare interface Store {
    members?: User[];
    products?: Product[];
    roles?: Role[];
  }
}

export declare module '@medusajs/medusa/dist/models/user' {
  declare interface User {
    store_id?: string;
    store?: Store;
    roles?: Role[];
  }
}

export declare module '@medusajs/medusa/dist/models/product' {
  declare interface Product {
    store_id?: string;
    store?: Store;
  }
}

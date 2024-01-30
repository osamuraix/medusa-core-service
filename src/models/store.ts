import { Store as MedusaStore } from '@medusajs/medusa';
import { Entity, JoinColumn, OneToMany } from 'typeorm';

import { Product } from './product';
import { Role } from './role';
import { User } from './user';

@Entity()
export class Store extends MedusaStore {
  @OneToMany(() => User, (user) => user?.store)
  members?: User[];

  @OneToMany(() => Product, (product) => product?.store)
  products?: Product[];

  @OneToMany(() => Role, (role) => role?.store)
  @JoinColumn({ name: 'id', referencedColumnName: 'store_id' })
  roles?: Role[];
}

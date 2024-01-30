import { User as MedusaUser } from '@medusajs/medusa';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

import { Role } from './role';
import { Store } from './store';

@Entity()
export class User extends MedusaUser {
  @Index('UserStoreId')
  @Column({ nullable: true })
  store_id?: string | null;

  @ManyToOne(() => Store, (store) => store.members)
  @JoinColumn({ name: 'store_id', referencedColumnName: 'id' })
  store?: Store;

  @ManyToMany(() => Role, (role) => role.users)
  roles?: Role[];

  // @ManyToMany(() => Role)
  // @JoinTable()
  // roles: Role[];
}

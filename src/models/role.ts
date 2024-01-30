import { SoftDeletableEntity } from '@medusajs/medusa';
import { generateEntityId } from '@medusajs/medusa/dist/utils';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { RoleItem } from './role-item';
import { Store } from './store';
import { User } from './user';

@Entity()
export class Role extends SoftDeletableEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Index('RoleStoreId')
  @Column({ nullable: true })
  store_id?: string;

  @ManyToOne(() => Store, (store) => store.roles)
  @JoinColumn({ name: 'store_id', referencedColumnName: 'id' })
  store?: Store;

  @ManyToMany(() => RoleItem)
  @JoinTable({
    name: 'role_items',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'item_id',
      referencedColumnName: 'id',
    },
  })
  items: RoleItem[];

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable({
    name: 'role_users',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users: User[];

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, 'role');
  }
}

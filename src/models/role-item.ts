import { BaseEntity } from '@medusajs/medusa';
import { generateEntityId } from '@medusajs/medusa/dist/utils';
import { BeforeInsert, Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Permission } from './permission';

@Entity()
export class RoleItem extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ unique: true })
  path: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_items',
    joinColumn: {
      name: 'item_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, 'ritm');
  }
}

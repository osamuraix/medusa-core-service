import { BaseEntity } from '@medusajs/medusa';
import { DbAwareColumn, generateEntityId } from '@medusajs/medusa/dist/utils';
import { BeforeInsert, Column, Entity, Index } from 'typeorm';

@Entity()
export class Permission extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @DbAwareColumn({ type: 'jsonb', nullable: true })
  metadata?: Record<string, boolean>;

  @Index('PermissionStoreId')
  @Column({ nullable: true })
  store_id?: string;

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, 'perm');
  }
}

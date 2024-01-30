import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Permission } from './permission';
import { Role } from './role';
import { RoleItem } from './role-item';

@Entity()
export class RoleItems extends BaseEntity {
  @PrimaryColumn()
  role_id: string;

  @PrimaryColumn()
  item_id: string;

  @PrimaryColumn()
  permission_id: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => RoleItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  roleItem: RoleItem;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}

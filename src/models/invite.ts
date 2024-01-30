import { Invite as MedusaInvite } from '@medusajs/medusa';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Invite extends MedusaInvite {
  @Index('InviteStoreId')
  @Column({ nullable: true })
  store_id?: string;
}

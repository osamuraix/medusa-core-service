import { BaseEntity } from '@medusajs/medusa';
import {
  DbAwareColumn,
  generateEntityId,
  resolveDbType,
} from '@medusajs/medusa/dist/utils';
import { BeforeInsert, Column, CreateDateColumn, Entity, Index } from 'typeorm';

export enum OtpSendVia {
  SMS = 'sms',
  EMAIL = 'email',
}

@Entity()
export class OtpRequests extends BaseEntity {
  @Index('OtpRequestsUserId')
  @Column({ type: 'varchar', nullable: true })
  user_id?: string;

  @Column({ type: 'varchar', nullable: true })
  request_id?: string;

  @DbAwareColumn({
    type: 'enum',
    enum: OtpSendVia,
    default: OtpSendVia.SMS,
  })
  send_via: OtpSendVia;

  @Column({ type: 'varchar' })
  send_to: string;

  @Column({ type: 'varchar' })
  ref_code: string;

  @Column({ type: 'varchar' })
  session_id: string;

  @Column({ type: 'numeric', default: 0 })
  failed_attempts: number;

  @CreateDateColumn({ type: resolveDbType('timestamptz') })
  expires_at: Date;

  @CreateDateColumn({ type: resolveDbType('timestamptz'), nullable: true })
  requested_at?: Date;

  @CreateDateColumn({ type: resolveDbType('timestamptz'), nullable: true })
  verified_at?: Date;

  @CreateDateColumn({ type: resolveDbType('timestamptz'), nullable: true })
  sent_at?: Date;

  @CreateDateColumn({ type: resolveDbType('timestamptz'), nullable: true })
  processed_at?: Date;

  /**
   * @apiIgnore
   */
  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, 'otp');
  }
}

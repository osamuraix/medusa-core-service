import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStoreIdToInvite1702889715712 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invite" ADD "store_id" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "InviteStoreId" ON "invite" ("store_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."InviteStoreId"`);
    await queryRunner.query(`ALTER TABLE "invite" DROP COLUMN "store_id"`);
  }
}

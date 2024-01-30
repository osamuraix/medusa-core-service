import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableRolePermission1701072768153
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "metadata" jsonb, "store_id" character varying, CONSTRAINT "PK_PERMISSION_ID" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "store_id" character varying, CONSTRAINT "PK_ROLE_ID" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_item" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "path" character varying UNIQUE NOT NULL, CONSTRAINT "PK_ROLE_ITEM_ID" PRIMARY KEY ("id"))`,
    );
    // await queryRunner.query(
    // `CREATE TABLE "role_permissions" ("role_id" character varying NOT NULL, "permission_id" character varying NOT NULL, CONSTRAINT "PK_ROLE_PERMISSIONS_ROLE_ID" PRIMARY KEY ("role_id", "permission_id"))`,
    // );
    await queryRunner.query(
      `CREATE TABLE "role_users" ("role_id" character varying NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_ROLE_USERS_ROLE_ID" PRIMARY KEY ("role_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_items" ("role_id" character varying NOT NULL, "item_id" character varying NOT NULL, "permission_id" character varying NOT NULL, CONSTRAINT "PK_ROLE_ITEMS_PERMISSIONS_ROLE_ID" PRIMARY KEY ("role_id", "item_id", "permission_id"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "PermissionStoreId" ON "permission" ("store_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "RoleStoreId" ON "role" ("store_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "RoleItemsRoleId" ON "role_items" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "RoleItemsItemId" ON "role_items" ("item_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "RoleItemsPermissionId" ON "role_items" ("permission_id") `,
    );
    // await queryRunner.query(
    // `CREATE INDEX "RolePermissionsRoleId" ON "role_permissions" ("role_id") `,
    // );
    // await queryRunner.query(
    // `CREATE INDEX "RolePermissionsPermissionId" ON "role_permissions" ("permission_id") `,
    // );
    await queryRunner.query(
      `CREATE INDEX "RoleUsersRoleId" ON "role_users" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "RoleUsersUserId" ON "role_users" ("user_id") `,
    );

    await queryRunner.query(
      `ALTER TABLE "permission" ADD CONSTRAINT "FK_PERMISSION_STORE_ID" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" ADD CONSTRAINT "FK_ROLE_STORE_ID" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_items" ADD CONSTRAINT "FK_ROLE_ITEMS_ROLE_ID" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_items" ADD CONSTRAINT "FK_ROLE_ITEMS_ITEM_ID" FOREIGN KEY ("item_id") REFERENCES "role_item"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_items" ADD CONSTRAINT "FK_ROLE_ITEMS_PERMISSION_ID" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    // await queryRunner.query(
    // // `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_ROLE_PERMISSIONS_ROLE_ID" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    // );
    // await queryRunner.query(
    // // `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_ROLE_PERMISSIONS_PERMISSION_ID" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    // );
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD CONSTRAINT "FK_ROLE_USERS_ROLE_ID" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD CONSTRAINT "FK_ROLE_USERS_USER_ID" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "permission" DROP CONSTRAINT "FK_PERMISSION_STORE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role" DROP CONSTRAINT "FK_ROLE_STORE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_items" DROP CONSTRAINT "FK_ROLE_ITEMS_ROLE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_items" DROP CONSTRAINT "FK_ROLE_ITEMS_ITEM_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_items" DROP CONSTRAINT "FK_ROLE_ITEMS_PERMISSION_ID"`,
    );
    // await queryRunner.query(
    // // `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_ROLE_PERMISSIONS_ROLE_ID"`,
    // );
    // await queryRunner.query(
    // // `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_ROLE_PERMISSIONS_PERMISSION_ID"`,
    // );
    await queryRunner.query(
      `ALTER TABLE "role_users" DROP CONSTRAINT "FK_ROLE_USERS_ROLE_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" DROP CONSTRAINT "FK_ROLE_USERS_USER_ID"`,
    );

    await queryRunner.query(`DROP INDEX "public"."PermissionStoreId"`);
    await queryRunner.query(`DROP INDEX "public"."RoleStoreId"`);
    await queryRunner.query(`DROP INDEX "public"."RolePermissionsRoleId"`);
    await queryRunner.query(
      `DROP INDEX "public"."RolePermissionsPermissionId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."RoleUsersRoleId"`);
    await queryRunner.query(`DROP INDEX "public"."RoleUsersUserId"`);

    await queryRunner.query(`DROP TABLE "role_users"`);
    await queryRunner.query(`DROP TABLE "role_item"`);
    await queryRunner.query(`DROP TABLE "role_items"`);
    // await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "permission"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableOtpRequests1703057379032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "otp_requests" (
                "id" character varying NOT NULL,
                "user_id" VARCHAR,
                "request_id" VARCHAR,
                "send_via" VARCHAR NOT NULL DEFAULT 'sms',
                "send_to" VARCHAR NOT NULL,
                "ref_code" VARCHAR NOT NULL,
                "session_id" character varying NOT NULL,
                "failed_attempts" NUMERIC NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "requested_at" TIMESTAMP WITH TIME ZONE,
                "verified_at" TIMESTAMP WITH TIME ZONE,
                "sent_at" TIMESTAMP WITH TIME ZONE,
                "processed_at" TIMESTAMP WITH TIME ZONE
            );
        `);

    await queryRunner.query(
      `CREATE INDEX "OtpRequestsUserId" ON "otp_requests" ("user_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."OtpRequestsUserId"`);

    await queryRunner.query(`
            DROP TABLE "otp_requests";
        `);
  }
}

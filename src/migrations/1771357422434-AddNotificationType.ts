import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationType1771357422434 implements MigrationInterface {
    name = 'AddNotificationType1771357422434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('trip', 'message', 'reminder')`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'trip'`);
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '10 minutes'`);
        await queryRunner.query(`CREATE INDEX "IDX_5f0cceaef187f5c7884891c9e0" ON "notifications" ("timestamp") `);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f" FOREIGN KEY ("activitiesId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f0cceaef187f5c7884891c9e0"`);
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f" FOREIGN KEY ("activitiesId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

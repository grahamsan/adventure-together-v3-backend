import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorUploadAndTrips1768010487028 implements MigrationInterface {
    name = 'RefactorUploadAndTrips1768010487028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f"`);
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '10 minutes'`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f" FOREIGN KEY ("activitiesId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f"`);
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f" FOREIGN KEY ("activitiesId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

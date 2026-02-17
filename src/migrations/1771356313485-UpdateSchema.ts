import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1771356313485 implements MigrationInterface {
    name = 'UpdateSchema1771356313485'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f"`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD "tripApplicationId" uuid`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "UQ_e76532f59258857bddb8d2b16ef" UNIQUE ("tripApplicationId")`);
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '10 minutes'`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_e76532f59258857bddb8d2b16ef" FOREIGN KEY ("tripApplicationId") REFERENCES "trip_applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f" FOREIGN KEY ("activitiesId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_e76532f59258857bddb8d2b16ef"`);
        await queryRunner.query(`ALTER TABLE "otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + '00:10:00')`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "UQ_e76532f59258857bddb8d2b16ef"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN "tripApplicationId"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f" FOREIGN KEY ("activitiesId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

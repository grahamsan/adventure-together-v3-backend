import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAcknowledgedTripDoneAt1772500000000
  implements MigrationInterface
{
  name = "AddAcknowledgedTripDoneAt1772500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trip_applications" ADD "acknowledgedTripDoneAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trip_applications" DROP COLUMN "acknowledgedTripDoneAt"`,
    );
  }
}

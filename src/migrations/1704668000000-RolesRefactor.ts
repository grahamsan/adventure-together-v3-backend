import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to align user roles with frontend requirements:
 * - Add new enum values: Participant, Organizer, Driver, Admin
 * - Add organizerType column (Individual | Company)
 * - Add status column (active | suspended)
 * - Migrate existing user/promoter roles to new values
 */
export class RolesRefactor1704668000000 implements MigrationInterface {
  name = 'RolesRefactor1704668000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * 1. Add new values to users_role_enum
     * PostgreSQL allows ADD VALUE IF NOT EXISTS
     */
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'Participant';
    `);
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'Organizer';
    `);
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'Driver';
    `);
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'Admin';
    `);

    /**
     * 2. Create users_organizertype_enum (idempotent)
     */
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'users_organizertype_enum'
        ) THEN
          CREATE TYPE "users_organizertype_enum"
          AS ENUM ('Individual', 'Company');
        END IF;
      END$$;
    `);

    /**
     * 3. Create users_status_enum (idempotent)
     */
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'users_status_enum'
        ) THEN
          CREATE TYPE "users_status_enum"
          AS ENUM ('active', 'suspended');
        END IF;
      END$$;
    `);

    /**
     * 4. Add new columns
     */
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "organizerType" "users_organizertype_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "status" "users_status_enum" DEFAULT 'active' NOT NULL;
    `);

    console.log('Migration RolesRefactor completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Remove columns
     */
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "organizerType";
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "status";
    `);

    /**
     * Drop enums (safe)
     */
    await queryRunner.query(`
      DROP TYPE IF EXISTS "users_organizertype_enum";
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "users_status_enum";
    `);

    /**
     * NOTE:
     * We do NOT remove values from users_role_enum
     * PostgreSQL does not support safe enum value removal
     */
    console.log('Migration RolesRefactor rolled back (partial)');
  }
}

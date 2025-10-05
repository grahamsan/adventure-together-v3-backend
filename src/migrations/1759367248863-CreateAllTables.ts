import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllTables1759367248863 implements MigrationInterface {
    name = 'CreateAllTables1759367248863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "placeId" uuid, CONSTRAINT "UQ_f462d5fd45a3980b4b85cebe5ce" UNIQUE ("userId", "placeId"), CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."places_type_enum" AS ENUM('restaurant', 'monument', 'hotel', 'museum', 'park')`);
        await queryRunner.query(`CREATE TABLE "places" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."places_type_enum" NOT NULL, "description" text, "latitude" double precision, "longitude" double precision, "address" character varying, "photos" text array, "likesCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1afab86e226b4c3bc9a74465c12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "editedAt" TIMESTAMP, "readByUserIds" text array NOT NULL DEFAULT '{}', "conversationId" uuid, "senderId" uuid NOT NULL, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."conversations_type_enum" AS ENUM('group', 'user2user')`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."conversations_type_enum" NOT NULL DEFAULT 'group', "name" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "activityId" uuid, CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."requests_status_enum" AS ENUM('pending', 'rejected', 'accepted')`);
        await queryRunner.query(`CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."requests_status_enum" NOT NULL DEFAULT 'pending', "message" text, "conversationId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" uuid NOT NULL, "activityId" uuid NOT NULL, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."activities_type_enum" AS ENUM('road-trip', 'event')`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL DEFAULT '0', "type" "public"."activities_type_enum" NOT NULL, "date" TIMESTAMP, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "hasCarpooling" boolean NOT NULL DEFAULT false, "carpoolingInfo" jsonb, "availablePlaces" integer, "meetingPoint" jsonb, "status" character varying NOT NULL DEFAULT 'published', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "promoterId" uuid NOT NULL, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trip_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "scheduledStart" TIMESTAMP, "scheduledEnd" TIMESTAMP, "orderIndex" integer, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "tripId" uuid, "activityId" uuid, CONSTRAINT "PK_b1477667835564b3b8878e40913" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trips" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" TIMESTAMP, "endDate" TIMESTAMP, "title" character varying NOT NULL, "notes" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" uuid NOT NULL, CONSTRAINT "PK_f71c231dee9c05a9522f9e840f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_priority_enum" AS ENUM('low', 'normal', 'high')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "action" jsonb, "priority" "public"."notifications_priority_enum" NOT NULL DEFAULT 'normal', "isRead" boolean NOT NULL DEFAULT false, "meta" jsonb, "recipientId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'promoter', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "firstName" character varying, "lastName" character varying, "name" character varying, "avatarUrl" character varying, "bio" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversation_users" ("conversationsId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_1758873031c647dd587d6f296a2" PRIMARY KEY ("conversationsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c482de2cf1b495c92f07fb7fdb" ON "conversation_users" ("conversationsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0f6eb3d814f135b48ac9e93ef5" ON "conversation_users" ("usersId") `);
        await queryRunner.query(`CREATE TABLE "activity_places" ("activitiesId" uuid NOT NULL, "placesId" uuid NOT NULL, CONSTRAINT "PK_2a18dad96aaa5ac421e1057336d" PRIMARY KEY ("activitiesId", "placesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f8a9ce6fcd87661f60924c44c5" ON "activity_places" ("activitiesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_62709026835b9670e882476398" ON "activity_places" ("placesId") `);
        await queryRunner.query(`CREATE TABLE "activity_participants" ("activitiesId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_11f4425414b19b6ee1a74b4b3b8" PRIMARY KEY ("activitiesId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b6bc2bd39ea1e1b942a7dbf457" ON "activity_participants" ("activitiesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_80f1f3078a54f2ccc273be2bb2" ON "activity_participants" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "likes" ADD CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "likes" ADD CONSTRAINT "FK_253065cd28b96868d118a235b28" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_a4b4c0cf1792ddbfd7a03cc9f6e" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_670f44ad50fac2e635f4213fa9b" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_a9d4201fc2a2d88f9b2f337be98" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_316ebd90735832ac1fa1357dc10" FOREIGN KEY ("promoterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trip_activities" ADD CONSTRAINT "FK_22225b6120d4761615fadb34d23" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trip_activities" ADD CONSTRAINT "FK_f697789da7b298f4c88e97752ce" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trips" ADD CONSTRAINT "FK_35d1cd8973830dfd41d637c61ee" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_db873ba9a123711a4bff527ccd5" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_users" ADD CONSTRAINT "FK_c482de2cf1b495c92f07fb7fdb7" FOREIGN KEY ("conversationsId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "conversation_users" ADD CONSTRAINT "FK_0f6eb3d814f135b48ac9e93ef56" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activity_places" ADD CONSTRAINT "FK_f8a9ce6fcd87661f60924c44c5d" FOREIGN KEY ("activitiesId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_places" ADD CONSTRAINT "FK_62709026835b9670e8824763980" FOREIGN KEY ("placesId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f" FOREIGN KEY ("activitiesId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "activity_participants" ADD CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_80f1f3078a54f2ccc273be2bb2d"`);
        await queryRunner.query(`ALTER TABLE "activity_participants" DROP CONSTRAINT "FK_b6bc2bd39ea1e1b942a7dbf457f"`);
        await queryRunner.query(`ALTER TABLE "activity_places" DROP CONSTRAINT "FK_62709026835b9670e8824763980"`);
        await queryRunner.query(`ALTER TABLE "activity_places" DROP CONSTRAINT "FK_f8a9ce6fcd87661f60924c44c5d"`);
        await queryRunner.query(`ALTER TABLE "conversation_users" DROP CONSTRAINT "FK_0f6eb3d814f135b48ac9e93ef56"`);
        await queryRunner.query(`ALTER TABLE "conversation_users" DROP CONSTRAINT "FK_c482de2cf1b495c92f07fb7fdb7"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_db873ba9a123711a4bff527ccd5"`);
        await queryRunner.query(`ALTER TABLE "trips" DROP CONSTRAINT "FK_35d1cd8973830dfd41d637c61ee"`);
        await queryRunner.query(`ALTER TABLE "trip_activities" DROP CONSTRAINT "FK_f697789da7b298f4c88e97752ce"`);
        await queryRunner.query(`ALTER TABLE "trip_activities" DROP CONSTRAINT "FK_22225b6120d4761615fadb34d23"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_316ebd90735832ac1fa1357dc10"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_a9d4201fc2a2d88f9b2f337be98"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_670f44ad50fac2e635f4213fa9b"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_a4b4c0cf1792ddbfd7a03cc9f6e"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_e5663ce0c730b2de83445e2fd19"`);
        await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_253065cd28b96868d118a235b28"`);
        await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_80f1f3078a54f2ccc273be2bb2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b6bc2bd39ea1e1b942a7dbf457"`);
        await queryRunner.query(`DROP TABLE "activity_participants"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62709026835b9670e882476398"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f8a9ce6fcd87661f60924c44c5"`);
        await queryRunner.query(`DROP TABLE "activity_places"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0f6eb3d814f135b48ac9e93ef5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c482de2cf1b495c92f07fb7fdb"`);
        await queryRunner.query(`DROP TABLE "conversation_users"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_priority_enum"`);
        await queryRunner.query(`DROP TABLE "trips"`);
        await queryRunner.query(`DROP TABLE "trip_activities"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TYPE "public"."activities_type_enum"`);
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TYPE "public"."requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TYPE "public"."conversations_type_enum"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "places"`);
        await queryRunner.query(`DROP TYPE "public"."places_type_enum"`);
        await queryRunner.query(`DROP TABLE "likes"`);
    }

}

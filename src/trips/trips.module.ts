import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { Trip } from './trip.entity';
import { TripApplication } from './trip-application.entity';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activity/activity.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, TripApplication, User, Activity, Vehicle]),
    ConversationsModule,
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}

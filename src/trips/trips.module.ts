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
import { NotificationsModule } from '../notifications/notifications.module';
import { Place } from '../places/place.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trip,
      TripApplication,
      User,
      Activity,
      Vehicle,
      Place,
    ]),
    ConversationsModule,
    NotificationsModule,
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}

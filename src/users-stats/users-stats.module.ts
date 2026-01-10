import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersStatsService } from './users-stats.service';
import { UsersStatsController } from './users-stats.controller';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/trip.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Activity } from '../activity/activity.entity';
import { Like } from '../likes/like.entity';
import { TripApplication } from '../trips/trip-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Trip,
      Vehicle,
      Activity,
      Like,
      TripApplication,
    ]),
  ],
  controllers: [UsersStatsController],
  providers: [UsersStatsService],
  exports: [UsersStatsService],
})
export class UsersStatsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { UserModule } from '../users/user.module';

import { Trip } from '../trips/trip.entity';
import { Activity } from '../activity/activity.entity';
import { Report } from '../reports/report.entity';
import { Message } from '../messages/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trip, Activity, Report, Message]),
    UserModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

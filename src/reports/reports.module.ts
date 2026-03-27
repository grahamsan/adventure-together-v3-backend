import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from './report.entity';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Trip])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

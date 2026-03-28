import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { Place } from './place.entity';
import { User } from '../users/entities/user.entity';
import { ReportsModule } from '../reports/reports.module';
import { ExperiencesModule } from '../experiences/experiences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, User]),
    ReportsModule,
    ExperiencesModule,
  ],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}

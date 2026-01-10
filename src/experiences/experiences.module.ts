import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperiencesService } from './experiences.service';
import { ExperiencesController } from './experiences.controller';
import { Activity } from '../activity/activity.entity';
import { User } from '../users/entities/user.entity';
import { Like } from '../likes/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, User, Like])],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}

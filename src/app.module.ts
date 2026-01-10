import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { Trip } from './trips/trip.entity';
import { Activity } from './activity/activity.entity';
import { Conversation } from './conversations/conversation.entity';
import { Message } from './messages/message.entity';
import { Notification } from './notifications/notification.entity';
import { Like } from './likes/like.entity';
import { Place } from './places/place.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { Request } from './request/request.entity';
import { TripActivity } from './trip-activity/trip-activity.entity';
import { Report } from './reports/report.entity';
import { Vehicle } from './vehicles/vehicle.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { TripsModule } from './trips/trips.module';
import { ConversationsModule } from './conversations/conversations.module';
import { AdminModule } from './admin/admin.module';
import { ReportsModule } from './reports/reports.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { PlacesModule } from './places/places.module';
import { UsersStatsModule } from './users-stats/users-stats.module';
import { TripApplication } from './trips/trip-application.entity';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/comment.entity';
import { CommentInteraction } from './comments/comment-interaction.entity';
import { UploadModule } from './upload/upload.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD as string,
        database: process.env.DATABASE_NAME,
        entities: [
          __dirname + '/**/*.entity{.ts,.js}',
          User,
          Trip,
          Activity,
          RefreshToken,
          Message,
          Conversation,
          Notification,
          Like,
          Place,
          Request,
          TripActivity,
          Report,
          Vehicle,
          TripApplication,
          Comment,
          CommentInteraction,
        ],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    UserModule,
    AuthModule,
    ExperiencesModule,
    TripsModule,
    ConversationsModule,
    AdminModule,
    ReportsModule,
    VehiclesModule,
    PlacesModule,
    UsersStatsModule,
    CommentsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

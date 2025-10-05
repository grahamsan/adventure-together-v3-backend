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
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
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
        ],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false, 
        },
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

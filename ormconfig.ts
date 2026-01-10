import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import { Trip } from './src/trips/trip.entity';
import { Activity } from './src/activity/activity.entity';
import { Conversation } from './src/conversations/conversation.entity';
import { Message } from './src/messages/message.entity';
import { Notification } from './src/notifications/notification.entity';
import { Like } from './src/likes/like.entity';
import { Place } from './src/places/place.entity';
import { RefreshToken } from './src/auth/entities/refresh-token.entity';
import { Request } from './src/request/request.entity';
import { TripActivity } from './src/trip-activity/trip-activity.entity';
import { Vehicle } from './src/vehicles/vehicle.entity';
import { Report } from './src/reports/report.entity';
import { TripApplication } from './src/trips/trip-application.entity';
import { Comment } from './src/comments/comment.entity';
import { CommentInteraction } from './src/comments/comment-interaction.entity';
import { Otp } from './src/auth/entities/otp.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD as string,
  database: process.env.DATABASE_NAME,
  entities: [
    User,
    Trip,
    Activity,
    Conversation,
    Message,
    Notification,
    Like,
    Place,
    RefreshToken,
    Request,
    TripActivity,
    Vehicle,
    Report,
    TripApplication,
    Comment,
    CommentInteraction,
    Otp,
  ],
  migrations: ['src/migrations/*.ts'],
  ssl: {
    rejectUnauthorized: false,
  },
});

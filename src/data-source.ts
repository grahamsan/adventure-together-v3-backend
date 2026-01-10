import { DataSource } from 'typeorm';
import { config } from 'dotenv';
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
import { Vehicle } from './vehicles/vehicle.entity';
import { Report } from './reports/report.entity';
import { TripApplication } from './trips/trip-application.entity';
import { Comment } from './comments/comment.entity';
import { CommentInteraction } from './comments/comment-interaction.entity';
import { Otp } from './auth/entities/otp.entity';

config();

// 🔍 Debug temporaire
console.log('Environment variables:');
console.log('HOST:', process.env.DATABASE_HOST);
console.log('PORT:', process.env.DATABASE_PORT);
console.log('USERNAME:', process.env.DATABASE_USERNAME);
console.log(
  'PASSWORD:',
  process.env.DATABASE_PASSWORD ? '***' : 'UNDEFINED ⚠️',
);
console.log('DATABASE:', process.env.DATABASE_NAME);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'your_database',
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
  synchronize: false,
});

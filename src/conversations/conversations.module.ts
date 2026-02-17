import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Conversation } from './conversation.entity';
import { Message } from '../messages/message.entity';
import { User } from '../users/entities/user.entity';

import { TripMessageGateway } from './trip-message.gateway';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, TripMessageGateway],
  exports: [ConversationsService],
})
export class ConversationsModule {}

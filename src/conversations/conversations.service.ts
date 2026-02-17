import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from '../messages/message.entity';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Trip } from '../trips/trip.entity';
import { TripApplication } from '../trips/trip-application.entity';
import { ConversationType, TripStatus } from '../common/enums';
import { TripMessageGateway } from './trip-message.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly tripMessageGateway: TripMessageGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(userId: string) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoin('conversation.associatedUsers', 'user')
      .where('user.id = :userId', { userId })
      .select('conversation.id')
      .getMany();

    const conversationIds = conversations.map((c) => c.id);
    if (conversationIds.length === 0) return [];

    const fullConversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.associatedUsers', 'user')
      .leftJoinAndSelect('conversation.activity', 'activity')
      .leftJoinAndSelect('conversation.trip', 'trip')
      .leftJoinAndSelect('conversation.tripApplication', 'tripApplication')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('conversation.id IN (:...ids)', { ids: conversationIds })
      .orderBy('message.timestamp', 'DESC')
      .getMany();

    return fullConversations.map((c) => {
      // Calculate unread count
      const unreadCount =
        c.messages?.filter((m) => !m.readByUserIds?.includes(userId)).length ||
        0;

      return {
        id: c.id,
        name:
          c.name ||
          (c.activity
            ? c.activity.title
            : c.trip
              ? `Trajet: ${c.trip.from} -> ${c.trip.to}`
              : 'Conversation'),
        type: c.type,
        trip: c.trip ? { from: c.trip.from, to: c.trip.to } : undefined,
        unreadCount,
        lastMessage: c.messages?.[0]
          ? this.mapMessageToDto(c.messages[0])
          : null,
        applyId: c.tripApplication?.id || undefined,
        destinataireId:
          c.type === ConversationType.USER2USER && c.associatedUsers
            ? c.associatedUsers.find((u) => u.id !== userId)?.id || null
            : null,
      };
    });
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id },
      relations: [
        'associatedUsers',
        'activity',
        'activity',
        'trip',
        'tripApplication',
        'messages',
        'messages.sender',
      ],
      order: { messages: { timestamp: 'ASC' } },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const isMember = conversation.associatedUsers?.some((u) => u.id === userId);
    if (!isMember) throw new ForbiddenException('Access denied');

    // Sanitize associatedUsers to remove password hash
    if (conversation.associatedUsers) {
      conversation.associatedUsers = conversation.associatedUsers.map(
        (user) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { passwordHash, ...sanitizedUser } = user;
          return sanitizedUser as User;
        },
      );
    }

    return {
      ...conversation,
      applyId: conversation.tripApplication?.id || undefined,
      destinataireId:
        conversation.type === ConversationType.USER2USER &&
        conversation.associatedUsers
          ? conversation.associatedUsers.find((u) => u.id !== userId)?.id ||
            null
          : null,
    };
  }

  async getMessages(
    conversationId: string,
    userId: string,
  ): Promise<MessageResponseDto[]> {
    const conversation = await this.findOne(conversationId, userId);
    const messages = conversation.messages || [];

    return messages.map((msg) => this.mapMessageToDto(msg));
  }

  async createTripGroupConversation(trip: Trip, driver: User) {
    const conversation = this.conversationRepo.create({
      type: ConversationType.GROUP,
      name: `Voyage ${trip.from} - ${trip.to} du ${trip.startDate.toISOString().split('T')[0]}`,
      trip,
      associatedUsers: [driver],
    });
    return this.conversationRepo.save(conversation);
  }

  async createApplicationPrivateConversation(
    trip: Trip,
    applicant: User,
    driver: User,
    application: TripApplication,
  ) {
    // Check if exists for this specific application
    const existing = await this.conversationRepo.findOne({
      where: {
        tripApplication: { id: application.id },
      },
      relations: ['associatedUsers'],
    });

    if (existing) return existing;

    const conversation = this.conversationRepo.create({
      type: ConversationType.USER2USER,
      trip,
      tripApplication: application,
      associatedUsers: [applicant, driver],
    });
    return this.conversationRepo.save(conversation);
  }

  async addUserToGroup(tripId: string, user: User) {
    const conversation = await this.conversationRepo.findOne({
      where: { trip: { id: tripId }, type: ConversationType.GROUP },
      relations: ['associatedUsers'],
    });

    if (conversation && conversation.associatedUsers) {
      if (!conversation.associatedUsers.some((u) => u.id === user.id)) {
        conversation.associatedUsers.push(user);
        await this.conversationRepo.save(conversation);
      }
    }
  }

  async createMessage(
    conversationId: string,
    userId: string,
    dto: CreateMessageDto,
    attachments: string[] = [],
  ): Promise<MessageResponseDto> {
    const conversation = await this.findOne(conversationId, userId);

    // Restriction logic: Disable if trip status is DONE
    if (conversation.trip && conversation.trip.status === TripStatus.DONE) {
      throw new ForbiddenException(
        'Le voyage est terminé. Les messages sont désactivés.',
      );
    }

    const sender = await this.userRepo.findOneBy({ id: userId });

    if (!sender) throw new NotFoundException('User not found');

    const message = this.messageRepo.create({
      conversation,
      sender,
      content: dto.text,
      attachments,
      timestamp: new Date(),
      readByUserIds: [userId], // Sender has read it
    });

    const saved = await this.messageRepo.save(message);

    await this.conversationRepo.update(conversationId, {
      updatedAt: new Date(),
    });

    const messageResponse = this.mapMessageToDto(saved);
    this.tripMessageGateway.server
      .to(conversationId)
      .emit('newMessage', messageResponse);

    // Send notification to all conversation members except the sender
    const convName =
      conversation.name ||
      (conversation.activity
        ? conversation.activity.title
        : conversation.trip
          ? `Trajet: ${conversation.trip.from} -> ${conversation.trip.to}`
          : 'Conversation');
    const recipients = conversation.associatedUsers || [];
    await this.notificationsService.notifyNewMessage(
      conversationId,
      sender,
      recipients,
      convName,
    );

    return messageResponse;
  }

  async updateMessage(
    messageId: string,
    userId: string,
    dto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender', 'conversation'],
    });

    if (!message) throw new NotFoundException('Message not found');
    if (message.sender.id !== userId)
      throw new ForbiddenException('You can only edit your own messages');

    message.content = dto.text;
    message.editedAt = new Date();

    const saved = await this.messageRepo.save(message);
    return this.mapMessageToDto(saved);
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) throw new NotFoundException('Message not found');
    if (message.sender.id !== userId)
      throw new ForbiddenException('You can only delete your own messages');

    await this.messageRepo.remove(message);
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.findOne(conversationId, userId);
    const messages = await this.messageRepo.find({
      where: { conversation: { id: conversationId } },
    });

    const unreadMessages = messages.filter(
      (m) => !m.readByUserIds.includes(userId),
    );

    if (unreadMessages.length > 0) {
      for (const msg of unreadMessages) {
        msg.readByUserIds.push(userId);
      }
      await this.messageRepo.save(unreadMessages);
    }
  }

  private mapMessageToDto(msg: Message): MessageResponseDto {
    return {
      id: msg.id,
      senderId: msg.sender ? msg.sender.id : 'unknown',
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      attachments: msg.attachments || [],
      senderName: msg.sender
        ? msg.sender.firstName
          ? `${msg.sender.firstName} ${msg.sender.lastName}`
          : msg.sender.name
        : undefined,
      senderAvatar: msg.sender?.avatarUrl || undefined,
      readByUserIds: msg.readByUserIds || [],
    };
  }
}

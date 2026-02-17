import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification } from './notification.entity';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/trip.entity';
import {
  NotificationPriority,
  NotificationType,
  RequestStatus,
  TripStatus,
} from '../common/enums';
import { NotificationAction } from '../common/types';
import { MailService } from '../mail/mail.service';
import { NotificationsGateway } from './notifications.gateway';
import {
  NotificationResponseDto,
  PaginatedNotificationsDto,
} from './dto/notification-response.dto';
import { TripApplication } from '../trips/trip-application.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
    @InjectRepository(TripApplication)
    private readonly applicationRepo: Repository<TripApplication>,
    private readonly mailService: MailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // ─── Core Methods ──────────────────────────────────────────────────

  async findAllForUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedNotificationsDto> {
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { recipient: { id: userId } },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: notifications.map((n) => this.mapToDto(n)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, recipient: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    await this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      { recipient: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

  // ─── Notification Creators ─────────────────────────────────────────

  /**
   * Notify the driver when a user applies to one of their trips.
   */
  async notifyDriverOfApplication(trip: Trip, applicant: User): Promise<void> {
    const driver = trip.owner;
    if (!driver) return;

    const title = 'Nouvelle candidature';
    const description = `${applicant.firstName || applicant.name || 'Un utilisateur'} a postulé pour votre voyage ${trip.from} → ${trip.to}.`;

    await this.createAndSend({
      recipient: driver,
      title,
      description,
      type: NotificationType.TRIP,
      priority: NotificationPriority.HIGH,
      action: {
        targetRoute: '/trips/:id',
        params: { tripId: trip.id },
      },
      meta: { tripId: trip.id, applicantId: applicant.id },
    });
  }

  /**
   * Notify the applicant when the driver accepts or rejects their application.
   */
  async notifyApplicantOfDecision(
    trip: Trip,
    applicant: User,
    status: RequestStatus,
  ): Promise<void> {
    const accepted = status === RequestStatus.ACCEPTED;
    const title = accepted ? 'Candidature acceptée 🎉' : 'Candidature refusée';
    const description = accepted
      ? `Votre candidature pour le voyage ${trip.from} → ${trip.to} a été acceptée !`
      : `Votre candidature pour le voyage ${trip.from} → ${trip.to} a été refusée.`;

    await this.createAndSend({
      recipient: applicant,
      title,
      description,
      type: NotificationType.TRIP,
      priority: NotificationPriority.HIGH,
      action: {
        targetRoute: '/trips/:id',
        params: { tripId: trip.id },
      },
      meta: { tripId: trip.id, accepted },
    });
  }

  /**
   * Notify all trip members when the trip is modified by the driver.
   */
  async notifyTripMembersOfUpdate(trip: Trip): Promise<void> {
    const applications = await this.applicationRepo.find({
      where: { trip: { id: trip.id }, status: RequestStatus.ACCEPTED },
      relations: ['applicant'],
    });

    const participants = applications
      .map((a) => a.applicant)
      .filter((u) => u && u.id !== trip.owner?.id);

    const title = 'Voyage modifié';
    const description = `Le voyage ${trip.from} → ${trip.to} a été modifié par le conducteur.`;

    for (const participant of participants) {
      await this.createAndSend({
        recipient: participant,
        title,
        description,
        type: NotificationType.TRIP,
        priority: NotificationPriority.NORMAL,
        action: {
          targetRoute: '/trips/:id',
          params: { tripId: trip.id },
        },
        meta: { tripId: trip.id },
      });
    }
  }

  /**
   * Notify all other users in a conversation when a new message is sent.
   */
  async notifyNewMessage(
    conversationId: string,
    senderUser: User,
    recipientUsers: User[],
    conversationName: string,
  ): Promise<void> {
    const senderName = senderUser.firstName
      ? `${senderUser.firstName} ${senderUser.lastName || ''}`
      : senderUser.name || "Quelqu'un";

    const title = 'Nouveau message';
    const description = `${senderName.trim()} a envoyé un message dans "${conversationName}".`;

    for (const recipient of recipientUsers) {
      if (recipient.id === senderUser.id) continue;

      await this.createAndSend({
        recipient,
        title,
        description,
        type: NotificationType.MESSAGE,
        priority: NotificationPriority.NORMAL,
        action: {
          targetRoute: '/conversations/:id',
          params: { conversationId },
        },
        meta: { conversationId, senderId: senderUser.id },
      });
    }
  }

  // ─── Reminder Cron Job ─────────────────────────────────────────────

  /**
   * Runs every day at 9 AM to check for upcoming trips and send reminders.
   * - 7 days before
   * - 3 days before
   * - 1 day before (veille)
   * - Day of the trip
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendTripReminders(): Promise<void> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const reminderDays = [
      { days: 7, label: 'dans une semaine' },
      { days: 3, label: 'dans 3 jours' },
      { days: 1, label: 'demain' },
      { days: 0, label: "aujourd'hui" },
    ];

    for (const { days, label } of reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      const targetStr = targetDate.toISOString().split('T')[0];

      // Find trips with startDate matching target date
      const trips = await this.tripRepo
        .createQueryBuilder('trip')
        .leftJoinAndSelect('trip.owner', 'owner')
        .leftJoinAndSelect('trip.applications', 'app')
        .leftJoinAndSelect('app.applicant', 'applicant')
        .where('DATE(trip.startDate) = :targetDate', {
          targetDate: targetStr,
        })
        .andWhere('trip.status IN (:...statuses)', {
          statuses: [TripStatus.FILLING, TripStatus.INCOMING],
        })
        .getMany();

      for (const trip of trips) {
        // Collect all participants (driver + accepted applicants)
        const recipients: User[] = [];
        if (trip.owner) recipients.push(trip.owner);

        if (trip.applications) {
          for (const app of trip.applications) {
            if (
              app.status === RequestStatus.ACCEPTED &&
              app.applicant &&
              app.applicant.id !== trip.owner?.id
            ) {
              recipients.push(app.applicant);
            }
          }
        }

        const title = 'Rappel de voyage 🗓️';
        const description = `Votre voyage ${trip.from} → ${trip.to} est ${label} !`;
        const reminderKey = `reminder_${trip.id}_${days}d`;

        for (const recipient of recipients) {
          // Prevent duplicate reminders: check if already sent
          const existing = await this.notificationRepo.findOne({
            where: {
              recipient: { id: recipient.id },
              meta: { reminderKey } as any,
            },
          });
          if (existing) continue;

          await this.createAndSend({
            recipient,
            title,
            description,
            type: NotificationType.REMINDER,
            priority:
              days === 0
                ? NotificationPriority.HIGH
                : NotificationPriority.NORMAL,
            action: {
              targetRoute: '/trips/:id',
              params: { tripId: trip.id },
            },
            meta: { tripId: trip.id, reminderKey, daysBeforeTrip: days },
          });
        }
      }
    }
  }

  // ─── Cleanup Cron Job ──────────────────────────────────────────────

  /**
   * Runs daily at midnight. Deletes notifications older than 3 months.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications(): Promise<void> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const result = await this.notificationRepo.delete({
      timestamp: LessThan(threeMonthsAgo),
    });

    if (result.affected && result.affected > 0) {
      console.log(
        `[Notifications] Cleaned up ${result.affected} old notifications.`,
      );
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────────

  private async createAndSend(params: {
    recipient: User;
    title: string;
    description: string;
    type: NotificationType;
    priority: NotificationPriority;
    action?: NotificationAction;
    meta?: Record<string, any>;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create({
      recipient: params.recipient,
      title: params.title,
      description: params.description,
      type: params.type,
      priority: params.priority,
      action: params.action,
      meta: params.meta,
    });

    const saved = await this.notificationRepo.save(notification);

    // Real-time via WebSocket
    const dto = this.mapToDto(saved);
    this.notificationsGateway.sendToUser(params.recipient.id, dto);

    // Email notification
    try {
      const userName =
        params.recipient.firstName || params.recipient.name || 'Utilisateur';

      await this.mailService.sendMail(
        params.recipient.email,
        `${params.title} - AdventureTogether`,
        `${params.title}\n\n${params.description}`,
      );
    } catch (error) {
      console.error(
        `[Notifications] Failed to send email to ${params.recipient.email}:`,
        error?.message || error,
      );
    }

    return saved;
  }

  private mapToDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      title: notification.title,
      description: notification.description,
      type: notification.type,
      priority: notification.priority,
      isRead: notification.isRead,
      timestamp: notification.timestamp?.toISOString(),
      action: notification.action,
      meta: notification.meta,
    };
  }
}

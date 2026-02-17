import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { NotificationPriority, NotificationType } from '../common/enums';
import { NotificationAction } from '../common/types';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.notifications, { onDelete: 'CASCADE' })
  recipient: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index()
  @CreateDateColumn()
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.TRIP,
  })
  type: NotificationType;

  @Column({ type: 'jsonb', nullable: true })
  action?: NotificationAction;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;
}

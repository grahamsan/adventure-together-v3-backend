import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { NotificationPriority } from '../common/enums';
import { NotificationAction } from '../common/types';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @ManyToOne(() => User, u => u.notifications, { onDelete: 'CASCADE' })
  recipient: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  timestamp: Date;


  @Column({ type: 'jsonb', nullable: true })
  action?: NotificationAction;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.NORMAL })
  priority: NotificationPriority;

  @Column({ default: false })
  isRead: boolean;


  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;
}

import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, ManyToMany, JoinTable
} from 'typeorm';
import { UserRole } from '../../common/enums';
import { Trip } from '../../trips/trip.entity';
import { Activity } from '../../activity/activity.entity';
import { Like } from '../../likes/like.entity';
import { Notification } from '../../notifications/notification.entity';
import { Conversation } from '../../conversations/conversation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Trip, trip => trip.owner)
  trips?: Trip[];

  @OneToMany(() => Activity, activity => activity.promoter)
  activitiesPromoted?: Activity[];

  @ManyToMany(() => Activity, activity => activity.participants)
  @JoinTable({ name: 'activity_participants' })
  activitiesParticipated?: Activity[];

  @OneToMany(() => Like, like => like.user)
  likes?: Like[];

  @OneToMany(() => Notification, n => n.recipient)
  notifications?: Notification[];

  @ManyToMany(() => Conversation, conv => conv.associatedUsers)
  conversations?: Conversation[];
}

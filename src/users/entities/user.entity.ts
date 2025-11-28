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

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  driverLicenseNumber?: string;

  // Champs spécifiques pour les promoteurs (entreprises)
  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  companyType?: string;

  @Column({ nullable: true })
  contactEmail?: string;

  @Column({ nullable: true })
  companyAddress?: string;

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

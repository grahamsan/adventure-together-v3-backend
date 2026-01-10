import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserRole, OrganizerType, UserStatus } from '../../common/enums';
import { Trip } from '../../trips/trip.entity';
import { Activity } from '../../activity/activity.entity';
import { Like } from '../../likes/like.entity';
import { Notification } from '../../notifications/notification.entity';
import { Conversation } from '../../conversations/conversation.entity';
import { Place } from '../../places/place.entity';
import { TripApplication } from '../../trips/trip-application.entity';

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PARTICIPANT })
  role: UserRole;

  // For Organizer role: Individual or Company
  @Column({ type: 'enum', enum: OrganizerType, nullable: true })
  organizerType?: OrganizerType;

  // Account status (active/suspended)
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

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

  @OneToMany(() => Trip, (trip) => trip.owner)
  trips?: Trip[];

  @OneToMany(() => Activity, (activity) => activity.promoter)
  activitiesPromoted?: Activity[];

  @ManyToMany(() => Activity, (activity) => activity.participants)
  @JoinTable({ name: 'activity_participants' })
  activitiesParticipated?: Activity[];

  @OneToMany(() => Like, (like) => like.user)
  likes?: Like[];

  @OneToMany(() => Notification, (n) => n.recipient)
  notifications?: Notification[];

  @ManyToMany(() => Conversation, (conv) => conv.associatedUsers)
  conversations?: Conversation[];

  @ManyToMany(() => Place, (place) => place.favoritedBy)
  @JoinTable({ name: 'user_favorite_places' })
  favoritePlaces?: Place[];

  @OneToMany(() => TripApplication, (app) => app.applicant)
  tripApplications?: TripApplication[];
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TripActivity } from '../trip-activity/trip-activity.entity';
import { Activity } from '../activity/activity.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Like } from '../likes/like.entity';
import { Conversation } from '../conversations/conversation.entity';
import { TripApplication } from './trip-application.entity';
import { TripStatus } from '../common/enums';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.trips, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  owner: User;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column()
  startHour: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  seatsAvailable: number;

  @Column({ type: 'int', default: 0 })
  seatsConfirmed: number;

  @Column({ type: 'text', array: true, default: [] })
  escales: string[];

  @ManyToOne(() => Activity, { nullable: true })
  associatedEvent?: Activity;

  @ManyToOne(() => Vehicle, { nullable: true })
  vehicle?: Vehicle;

  @OneToMany(() => Like, (like) => like.trip)
  likes: Like[];

  // Legacy or future usage
  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.FILLING,
  })
  status: TripStatus;

  @OneToMany(() => TripActivity, (ta) => ta.trip, { cascade: true })
  activities?: TripActivity[];

  @OneToMany(() => Conversation, (conv) => conv.trip)
  conversations?: Conversation[];

  @OneToMany(() => TripApplication, (app) => app.trip)
  applications?: TripApplication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

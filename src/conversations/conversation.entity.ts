// conversation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ConversationType } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { Message } from '../messages/message.entity';
import { Activity } from '../activity/activity.entity';
import { Trip } from '../trips/trip.entity';
import { TripApplication } from '../trips/trip-application.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Activity, (activity) => activity.conversations, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  activity?: Activity;

  @ManyToOne(() => Trip, (trip) => trip.conversations, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  trip?: Trip;

  @OneToOne(() => TripApplication, { nullable: true })
  @JoinColumn()
  tripApplication?: TripApplication;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.GROUP,
  })
  type: ConversationType;

  @Column({ nullable: true })
  name?: string; // nom du groupe

  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable({ name: 'conversation_users' })
  associatedUsers?: User[];

  @OneToMany(() => Message, (msg) => msg.conversation, { cascade: true })
  messages?: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

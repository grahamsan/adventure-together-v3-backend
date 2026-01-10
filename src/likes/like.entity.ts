import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  Column,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Place } from '../places/place.entity';
import { Activity } from '../activity/activity.entity';
import { Trip } from '../trips/trip.entity';

@Entity('likes')
// @Unique(['user', 'place']) // Constraint needs update for polymorphism or removed/handled in code
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Place, (p) => p.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  place?: Place;

  @ManyToOne(() => Activity, (a) => a.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  activity?: Activity;

  @ManyToOne(() => Trip, (t) => t.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  trip?: Trip;

  @CreateDateColumn()
  createdAt: Date;
}

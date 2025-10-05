// trip-activity.entity.ts (link between Trip and Activity, allows scheduling + ordering)
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Trip } from '../trips/trip.entity';
import { Activity } from '../activity/activity.entity';

@Entity('trip_activities')
export class TripActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Trip, trip => trip.activities, { onDelete: 'CASCADE' })
  trip: Trip;

  @ManyToOne(() => Activity, activity => activity, { eager: true, onDelete: 'SET NULL' })
  activity: Activity;

  // date/heure planifiés pour cette activité dans le trip
  @Column({ type: 'timestamp', nullable: true })
  scheduledStart?: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledEnd?: Date;

  @Column({ type: 'int', nullable: true })
  orderIndex?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}

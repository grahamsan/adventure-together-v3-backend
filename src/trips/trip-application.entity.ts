import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Trip } from './trip.entity';
import { User } from '../users/entities/user.entity';
import { RequestStatus } from '../common/enums';

@Entity('trip_applications')
export class TripApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  trip: Trip;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  applicant: User;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ type: 'int', default: 1 })
  requestedSeats: number;

  @CreateDateColumn()
  createdAt: Date;

  /** Accusé de réception « voyage effectué » (POST /trips/:id/ack-completion) */
  @Column({ type: 'timestamp', nullable: true })
  acknowledgedTripDoneAt?: Date | null;
}

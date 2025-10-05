import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activity/activity.entity';
import { RequestStatus } from '../common/enums';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => Activity, activity => activity.requests, { nullable: false, onDelete: 'CASCADE' })
  activity: Activity;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  // message optionnel envoyé avec la demande
  @Column({ type: 'text', nullable: true })
  message?: string;

  // si tu crée une conversation en même temps (id référentiel)
  @Column({ type: 'uuid', nullable: true })
  conversationId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

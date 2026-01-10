import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ReportStatus, ReportEntityType } from '../common/enums';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  reporter: User;

  @Column()
  entityId: string;

  @Column({ type: 'enum', enum: ReportEntityType })
  entityType: ReportEntityType;

  @Column({ type: 'text' })
  motif: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.NEW })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  processedAt?: Date;

  @Column({ nullable: true })
  resolutionAction?: 'ignored' | 'validated';
}

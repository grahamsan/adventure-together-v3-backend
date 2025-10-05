import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable,
    OneToMany, CreateDateColumn, UpdateDateColumn
  } from 'typeorm';
  import { ActivityType } from '../common/enums';
  import { User } from '../users/entities/user.entity';
  import { Place } from '../places/place.entity';
  import { Conversation } from '../conversations/conversation.entity';
  import { Request } from '../request/request.entity';
  import { CarpoolingInfo } from '../common/types';
  import { MeetingPoint } from '../common/types';
  
  @Entity('activities')
  export class Activity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @Column({ type: 'text', nullable: true })
    description?: string;
  
    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    price: number;
  
    @Column({ type: 'enum', enum: ActivityType })
    type: ActivityType;
  
    // pour event
    @Column({ type: 'timestamp', nullable: true })
    date?: Date;
  
    // pour road-trip
    @Column({ type: 'timestamp', nullable: true })
    startDate?: Date;
  
    @Column({ type: 'timestamp', nullable: true })
    endDate?: Date;
  
    @Column({ default: false })
    hasCarpooling: boolean;
  
    // JSONB pour stocker plusieurs offres de covoiturage
    @Column({ type: 'jsonb', nullable: true })
    carpoolingInfo?: CarpoolingInfo[];
  
    @Column({ type: 'int', nullable: true })
    availablePlaces?: number;
  
    // JSON meeting point (lon/lat + texte)
    @Column({ type: 'jsonb', nullable: true })
    meetingPoint?: MeetingPoint;
  
    // places associées (many-to-many pour road-trip)
    @ManyToMany(() => Place, { cascade: true })
    @JoinTable({ name: 'activity_places' })
    associatedPlaces?: Place[];
  
    // promoteur
    @ManyToOne(() => User, u => u.activitiesPromoted, { nullable: false, onDelete: 'CASCADE' })
    promoter: User;
  
    // participants
    @ManyToMany(() => User, u => u.activitiesParticipated)
    @JoinTable({ name: 'activity_participants' })
    participants?: User[];
  
    // conversation(s) associées (ex: discussion de l'activité)
    @OneToMany(() => Conversation, conv => conv.activity)
    conversations?: Conversation[];
  
    // requests
    @OneToMany(() => Request, r => r.activity)
    requests?: Request[];
  
    @Column({ default: 'published' })
    status: 'draft' | 'published' | 'cancelled';
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  
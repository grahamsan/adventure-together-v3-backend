// conversation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ConversationType } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { Message } from '../messages/message.entity';
import { Activity } from '../activity/activity.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // lien optionnel vers une activité
  @ManyToOne(() => Activity, activity => activity.conversations, { nullable: true, onDelete: 'CASCADE' })
  activity?: Activity;

  @Column({ type: 'enum', enum: ConversationType, default: ConversationType.GROUP })
  type: ConversationType;

  @Column({ nullable: true })
  name?: string; // nom du groupe

  @ManyToMany(() => User, user => user.conversations)
  @JoinTable({ name: 'conversation_users' })
  associatedUsers?: User[];

  @OneToMany(() => Message, msg => msg.conversation, { cascade: true })
  messages?: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

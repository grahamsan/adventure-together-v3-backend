// message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Conversation } from '../conversations/conversation.entity';
import { User } from '../users/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, conv => conv.messages, { onDelete: 'CASCADE' })
  conversation: Conversation;

  @ManyToOne(() => User, { nullable: false, onDelete: 'SET NULL' })
  sender: User;

  // uniquement du texte selon ton besoin
  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'timestamp', nullable: true })
  editedAt?: Date;

  // read receipts : tableau d'IDs utilisateurs ayant lu (jsonb) — simple et efficace
  @Column({ type: 'text', array: true, default: [] })
  readByUserIds: string[];
}

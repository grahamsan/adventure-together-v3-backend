import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Comment } from './comment.entity';

export enum InteractionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity('comment_interactions')
@Unique(['user', 'comment'])
export class CommentInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Comment, (c) => c.interactions, { onDelete: 'CASCADE' })
  comment: Comment;

  @Column({ type: 'enum', enum: InteractionType })
  type: InteractionType;
}

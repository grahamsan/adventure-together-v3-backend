import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Place } from '../places/place.entity';

@Entity('likes')
@Unique(['user','place'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, u => u.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Place, p => p.likes, { onDelete: 'CASCADE' })
  place: Place;

  @CreateDateColumn()
  createdAt: Date;
}

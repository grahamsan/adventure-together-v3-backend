import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { PlaceType } from '../common/enums';
import { Like } from '../likes/like.entity';
import { Activity } from '../activity/activity.entity';
import { User } from '../users/entities/user.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: PlaceType })
  type: PlaceType;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'double precision', nullable: true })
  latitude?: number;

  @Column({ type: 'double precision', nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'text', array: true, nullable: true })
  photos?: string[];

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Like, (like) => like.place)
  likes?: Like[];

  @OneToMany(() => Activity, (activity) => activity.associatedPlaces)
  activities?: Activity[];

  @ManyToMany(() => User, (user) => user.favoritePlaces)
  favoritedBy?: User[];
}

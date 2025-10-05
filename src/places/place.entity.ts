import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PlaceType } from '../common/enums';
import { Like } from '../likes/like.entity';
import { Activity } from '../activity/activity.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: PlaceType })
  type: PlaceType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // localisation simple
  @Column({ type: 'double precision', nullable: true })
  latitude?: number;

  @Column({ type: 'double precision', nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'text', array: true, nullable: true })
  photos?: string[];

  // cache du nombre de likes (utile pour reads rapides)
  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Like, like => like.place)
  likes?: Like[];

  @OneToMany(() => Activity, activity => activity.associatedPlaces)
  activities?: Activity[];
}

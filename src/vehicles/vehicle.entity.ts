import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/trip.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => Trip, (trip) => trip.vehicle)
  trips: Trip[];

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  plateNumber?: string;

  @Column({ type: 'int', default: 4 })
  seats: number;

  @Column({ nullable: true })
  imageUrl?: string;
}

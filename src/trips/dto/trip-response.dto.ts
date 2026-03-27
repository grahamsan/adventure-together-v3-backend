import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '../../common/enums';
import { Vehicle } from 'src/vehicles/vehicle.entity';

export class CreatorDto {
  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ nullable: true })
  bio: string | null;

  @ApiProperty({ nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true })
  dateOfBirth: string | null;
}

export class TripResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  date: string; // startDate

  @ApiProperty()
  time: string; // startHour

  @ApiProperty()
  description: string;

  @ApiProperty()
  seatsAvailable: number;

  @ApiProperty()
  seatsConfirmed: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  escales: string[];

  @ApiProperty({ enum: TripStatus })
  status: TripStatus;

  @ApiProperty({ description: 'Name of the related experience, if any' })
  relatedExpName: string;

  @ApiProperty({ description: 'Name of the related place, if any' })
  relatedPlaceName: string;

  @ApiProperty({ nullable: true })
  driverName?: string;

  @ApiProperty({ nullable: true })
  vehicleModel?: string;

  @ApiProperty({ nullable: true })
  vehicle?: Vehicle;

  @ApiProperty()
  creator: CreatorDto;

  @ApiProperty({
    description: 'True if the current user has applied to this trip',
  })
  hasApplied: boolean;

  @ApiProperty({ description: 'Driver / owner user id' })
  ownerId: string;

  @ApiProperty({
    description: 'Number of applications (candidatures) for this trip',
  })
  applicationsCount: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '../../common/enums';

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

  @ApiProperty()
  associatedEventName: string;

  @ApiProperty({ nullable: true })
  driverName?: string;

  @ApiProperty({ nullable: true })
  vehicleModel?: string;
}

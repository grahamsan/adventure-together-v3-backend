import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({ example: 'Cotonou' })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ example: 'Parakou' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @IsNotEmpty()
  startHour: string;

  @ApiProperty({ example: 'Trip to Parakou for the festival' })
  @IsString()
  @IsNotEmpty()
  tripDescription: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  seatsAvailable: number;

  // Optional: associated event title or ID (frontend sends title usually per doc, but ID is better)
  @ApiProperty({
    example: 'Beach Party',
    deprecated: true,
    description: 'DEPRECATED: Use experienceId instead.',
  })
  @IsOptional()
  @IsString()
  associatedEventTitle?: string;

  @ApiProperty({
    name: 'experienceId',
    description: 'ID of the associated experience (activity)',
    example: 'uuid-of-experience',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  experienceId?: string;

  @ApiProperty({
    name: 'placeId',
    description: 'ID of the associated place',
    example: 'uuid-of-place',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  placeId?: string;

  @ApiProperty({ example: ['Bohicon', 'Dassa'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  escales?: string[];

  @ApiProperty({ example: 'uuid-of-vehicle' })
  @IsOptional()
  @IsUUID()
  associatedVehicle?: string;
}

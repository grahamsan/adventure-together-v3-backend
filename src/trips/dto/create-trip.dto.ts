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
  @ApiProperty({ example: 'Beach Party' })
  @IsOptional()
  @IsString()
  associatedEventTitle?: string;

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

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({ example: 'ABC-1234' })
  @IsString()
  @IsOptional()
  plateNumber?: string;

  @ApiProperty({ example: 4, default: 4 })
  @IsInt()
  @Min(1)
  seats: number;

  @ApiPropertyOptional({ example: 'https://example.com/car.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

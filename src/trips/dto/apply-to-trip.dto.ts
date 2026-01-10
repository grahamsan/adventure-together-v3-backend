import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyToTripDto {
  @ApiProperty({ example: 'I would like to join this trip.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  requestedSeats: number;
}

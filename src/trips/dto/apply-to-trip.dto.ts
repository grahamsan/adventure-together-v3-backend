import { IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyToTripDto {
  /** Motivation libre ; si vide, un texte par défaut est généré côté serveur dans le 1er message de conversation. */
  @ApiProperty({ required: false, example: 'Je serais ravi de participer.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  requestedSeats: number;
}

import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../../common/enums';

export class CreateExperienceDto {
  @ApiProperty({ example: 'Beach Party Cotonou', minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @ApiProperty({ example: 'An amazing beach party experience', minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  description: string;

  @ApiProperty({ example: 'Cotonou, Benin', minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  location: string;

  @ApiProperty({ example: '2026-02-01T10:00:00Z' })
  @IsDateString()
  dateStart: string;

  @ApiProperty({ example: '2026-02-02T18:00:00Z' })
  @IsDateString()
  dateEnd: string;

  @ApiPropertyOptional({ enum: ActivityType, default: ActivityType.EVENT })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  // Note: image will be handled separately via file upload
  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  image?: string;
}

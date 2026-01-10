import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportEntityType, ReportStatus } from '../../common/enums';

export class CreateReportDto {
  @ApiProperty({ enum: ReportEntityType, example: ReportEntityType.EXPERIENCE })
  @IsEnum(ReportEntityType)
  @IsNotEmpty()
  entityType: ReportEntityType;

  @ApiProperty({ example: 'uuid-of-entity' })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ example: 'Inappropriate content' })
  @IsString()
  @IsNotEmpty()
  motif: string;
}

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus, example: ReportStatus.PROCESSED })
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;
}

import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  MinLength,
  ValidateIf,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { UserRole, OrganizerType } from '../../common/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  // For Organizer role: Individual or Company
  @ValidateIf(
    (o) => o.role === UserRole.ORGANIZER || o.role === UserRole.PROMOTER,
  )
  @IsEnum(OrganizerType)
  organizerType?: OrganizerType;

  // Personal details (Participant, Driver, Organizer Individual)
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  // Driver-specific
  @IsOptional()
  @IsString()
  driverLicenseNumber?: string;

  // Company Organizer fields
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyType?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;
}

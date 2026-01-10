// src/auth/dto/register.dto.ts
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { UserRole, OrganizerType } from '../../common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for user registration - aligned with frontend multi-step registration
 *
 * Step 1: Role selection (Participant, Organizer, Driver)
 * Step 2: Personal/Company details (conditional based on role)
 * Step 3: Password
 */
export class RegisterDto {
  // ─────────────────────────────────────────────────────────────────
  // STEP 1: Role Selection
  // ─────────────────────────────────────────────────────────────────

  @ApiProperty({
    enum: UserRole,
    example: 'Participant',
    description: 'User role: Participant, Organizer, or Driver',
  })
  @IsEnum(UserRole, {
    message: 'role must be one of: Participant, Organizer, Driver',
  })
  role: UserRole;

  @ApiPropertyOptional({
    enum: OrganizerType,
    example: 'Individual',
    description: 'Required for Organizer role: Individual or Company',
  })
  @ValidateIf(
    (o) => o.role === UserRole.ORGANIZER || o.role === UserRole.PROMOTER,
  )
  @IsEnum(OrganizerType, {
    message: 'organizerType must be Individual or Company for Organizer role',
  })
  organizerType?: OrganizerType;

  // ─────────────────────────────────────────────────────────────────
  // STEP 2A: Personal Details (Participant, Driver, Organizer Individual)
  // ─────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'John' })
  @ValidateIf((o) => isPersonalInfoRequired(o))
  @IsString()
  @IsNotEmpty({ message: 'firstName is required for this role' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @ValidateIf((o) => isPersonalInfoRequired(o))
  @IsString()
  @IsNotEmpty({ message: 'lastName is required for this role' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+229 12345678' })
  @ValidateIf((o) => isPersonalInfoRequired(o))
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @ValidateIf((o) => isPersonalInfoRequired(o))
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  // ─────────────────────────────────────────────────────────────────
  // STEP 2B: Driver-specific fields
  // ─────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'DL-123456789' })
  @ValidateIf((o) => o.role === UserRole.DRIVER)
  @IsString()
  @IsNotEmpty({ message: 'driverLicenseNumber is required for Driver role' })
  driverLicenseNumber?: string;

  // ─────────────────────────────────────────────────────────────────
  // STEP 2C: Company Details (Organizer Company only)
  // ─────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'Travel Benin Tours' })
  @ValidateIf((o) => isCompanyOrganizerRole(o))
  @IsString()
  @IsNotEmpty({ message: 'companyName is required for Company organizer' })
  companyName?: string;

  @ApiPropertyOptional({
    example: 'Hotel',
    description: 'Company type: Restaurant, Hotel, etc.',
  })
  @ValidateIf((o) => isCompanyOrganizerRole(o))
  @IsString()
  @IsNotEmpty({ message: 'companyType is required for Company organizer' })
  companyType?: string;

  @ApiPropertyOptional({ example: 'contact@travelbenin.com' })
  @ValidateIf((o) => isCompanyOrganizerRole(o))
  @IsEmail()
  @IsNotEmpty({ message: 'contactEmail is required for Company organizer' })
  contactEmail?: string;

  @ApiPropertyOptional({ example: '123 Cotonou, Benin' })
  @ValidateIf((o) => isCompanyOrganizerRole(o))
  @IsString()
  @IsNotEmpty({ message: 'companyAddress is required for Company organizer' })
  companyAddress?: string;

  // ─────────────────────────────────────────────────────────────────
  // STEP 3: Credentials (all roles)
  // ─────────────────────────────────────────────────────────────────

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

// ─────────────────────────────────────────────────────────────────
// Helper functions for conditional validation
// ─────────────────────────────────────────────────────────────────

/**
 * Returns true if personal info (firstName, lastName, etc.) is required
 * This applies to: Participant, Driver, Organizer Individual, and legacy 'user'
 */
function isPersonalInfoRequired(dto: RegisterDto): boolean {
  // Legacy 'user' role
  if (dto.role === UserRole.USER) return true;
  // Participant role
  if (dto.role === UserRole.PARTICIPANT) return true;
  // Driver role
  if (dto.role === UserRole.DRIVER) return true;
  // Organizer Individual
  if (
    (dto.role === UserRole.ORGANIZER || dto.role === UserRole.PROMOTER) &&
    dto.organizerType === OrganizerType.INDIVIDUAL
  ) {
    return true;
  }
  return false;
}

/**
 * Returns true if this is a Company organizer (requires company fields)
 */
function isCompanyOrganizerRole(dto: RegisterDto): boolean {
  return (
    (dto.role === UserRole.ORGANIZER || dto.role === UserRole.PROMOTER) &&
    dto.organizerType === OrganizerType.COMPANY
  );
}

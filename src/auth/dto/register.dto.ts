// src/auth/dto/register.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, ValidateIf, IsOptional, IsDateString } from 'class-validator';
import { UserRole } from '../../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ example: 'password' })
  password: string;

  @IsEnum(UserRole)
  @ApiProperty({ example: 'USER' })
  role: UserRole;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '123456789' })
  phoneNumber?: string;

  // Champs pour USER ou PROMOTER particulier
  @ValidateIf(o => o.role === UserRole.USER || (o.role === UserRole.PROMOTER && o.firstName))
  @IsString()
  @ApiProperty({ example: 'John' })
  firstName?: string;

  @ValidateIf(o => o.role === UserRole.USER || (o.role === UserRole.PROMOTER && o.lastName))
  @IsString()
  @ApiProperty({ example: 'Doe' })
  lastName?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2000-01-01' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '123456789' })
  driverLicenseNumber?: string;

  // Champs pour PROMOTER entreprise
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'John' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Doe' })
  companyName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Company Type' })
  companyType?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'contact@example.com' })
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '123 Main St' })
  companyAddress?: string;
}

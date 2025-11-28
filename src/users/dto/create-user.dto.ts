import { IsEmail, IsNotEmpty, IsEnum, MinLength, ValidateIf, IsString, IsOptional, IsDateString } from 'class-validator';
import { UserRole } from '../../common/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  // Champs pour USER ou PROMOTER particulier
  @ValidateIf(o => o.role === UserRole.USER || (o.role === UserRole.PROMOTER && o.firstName))
  @IsString()
  firstName?: string;

  @ValidateIf(o => o.role === UserRole.USER || (o.role === UserRole.PROMOTER && o.lastName))
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  driverLicenseNumber?: string;

  // Champs pour PROMOTER entreprise
  @IsOptional()
  @IsString()
  name?: string;

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

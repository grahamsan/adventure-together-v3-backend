// src/auth/dto/register.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';
import { UserRole } from '../../common/enums';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @ValidateIf(o => o.role === UserRole.USER)
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @ValidateIf(o => o.role === UserRole.USER)
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  @ValidateIf(o => o.role === UserRole.PROMOTER)
  @IsNotEmpty()
  @IsString()
  name?: string;
}

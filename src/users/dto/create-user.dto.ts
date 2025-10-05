import { IsEmail, IsNotEmpty, IsEnum, MinLength, ValidateIf, IsString } from 'class-validator';
import { UserRole } from '../../common/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  // Obligatoire seulement si role = user
  @ValidateIf(o => o.role === UserRole.USER)
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @ValidateIf(o => o.role === UserRole.USER)
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  // Obligatoire seulement si role = promoter
  @ValidateIf(o => o.role === UserRole.PROMOTER)
  @IsNotEmpty()
  @IsString()
  name?: string;
}

import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Mot de passe actuel',
  })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({
    example: 'newPassword456',
    description: 'Nouveau mot de passe (min 6 caractères)',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

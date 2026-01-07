import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPasswordChangeDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6, {
    message: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
  })
  newPassword: string;
}

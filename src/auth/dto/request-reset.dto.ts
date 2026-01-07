import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

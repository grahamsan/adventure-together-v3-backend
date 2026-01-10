import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums';

class AuthUserDto {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John', required: false })
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  lastName?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PARTICIPANT })
  role: UserRole;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'jwt.token.here' })
  accessToken: string;

  @ApiProperty({ example: '7d' })
  expiresIn: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}

export class RegisterResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;

  @ApiProperty({ example: 'jwt.token.here' })
  accessToken: string;
}

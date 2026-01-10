import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, OrganizerType, UserStatus } from '../../common/enums';

class AuthUserDto {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: false })
  isEmailVerified: boolean;

  @ApiProperty({ enum: UserRole, example: UserRole.PARTICIPANT })
  role: UserRole;

  @ApiPropertyOptional({
    enum: OrganizerType,
    example: OrganizerType.INDIVIDUAL,
  })
  organizerType?: OrganizerType;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'I love traveling!' })
  bio?: string;

  @ApiPropertyOptional({ example: '+22912345678' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'DL123456' })
  driverLicenseNumber?: string;

  @ApiPropertyOptional({ example: 'My Company' })
  companyName?: string;

  @ApiPropertyOptional({ example: 'Tourism' })
  companyType?: string;

  @ApiPropertyOptional({ example: 'contact@mycompany.com' })
  contactEmail?: string;

  @ApiPropertyOptional({ example: 'Cotonou, Benin' })
  companyAddress?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
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

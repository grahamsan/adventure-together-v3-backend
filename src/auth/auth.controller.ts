import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmPasswordChangeDto } from './dto/confirm-password-change.dto';
import { LoginResponseDto, RegisterResponseDto } from './dto/auth-response.dto';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  NotFoundResponseDto,
  SuccessResponseDto,
} from '../common/dto/api-responses.dto';
import { UserService } from '../users/user.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        accessToken: { type: 'string', example: 'jwt.token.here' },
        data: { $ref: '#/components/schemas/RegisterResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: BadRequestResponseDto,
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and receive JWT' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Login successful.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        accessToken: { type: 'string', example: 'jwt.token.here' },
        data: { $ref: '#/components/schemas/LoginResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
    type: UnauthorizedResponseDto,
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token.',
    type: UnauthorizedResponseDto,
  })
  getProfile(@Request() req) {
    const userId = req.user.sub || req.user.id;
    return this.userService.findOne(userId);
  }

  // --- Vérification d'email ---
  @Post('send-verification')
  @ApiOperation({ summary: 'Send an email verification code' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Verification code sent.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    type: NotFoundResponseDto,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'user@example.com' } },
    },
  })
  sendVerification(@Body('email') email: string) {
    return this.authService.sendVerificationCode(email);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with a code' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Email verified.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired code.',
    type: BadRequestResponseDto,
  })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  // --- Mot de passe oublié ---
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset code' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reset code sent if user exists.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    type: NotFoundResponseDto,
  })
  requestReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using a code' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Password reset.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired code.',
    type: BadRequestResponseDto,
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // --- Changement de mot de passe (utilisateur connecté) ---
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @ApiOperation({ summary: 'Request password change (authenticated)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Change request initiated, code sent.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid token.',
    type: UnauthorizedResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Incorrect old password.',
    type: BadRequestResponseDto,
  })
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('confirm-password-change')
  @ApiOperation({ summary: 'Confirm password change with code' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Password changed.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 201 },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired code.',
    type: BadRequestResponseDto,
  })
  confirmPasswordChange(@Request() req, @Body() dto: ConfirmPasswordChangeDto) {
    return this.authService.confirmPasswordChange(
      req.user.sub,
      dto.code,
      dto.newPassword,
    );
  }
}

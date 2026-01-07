import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfirmPasswordChangeDto } from './dto/confirm-password-change.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // --- Vérification d'email ---
  @Post('send-verification')
  sendVerification(@Body('email') email: string) {
    return this.authService.sendVerificationCode(email);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  // --- Mot de passe oublié ---
  @Post('forgot-password')
  requestReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // --- Changement de mot de passe (utilisateur connecté) ---
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm-password-change')
  confirmPasswordChange(@Request() req, @Body() dto: ConfirmPasswordChangeDto) {
    return this.authService.confirmPasswordChange(
      req.user.sub,
      dto.code,
      dto.newPassword,
    );
  }
}

import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { EmailType } from './types/email.types';

@ApiTags('Mail (Testing only)')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test/verification')
  @ApiOperation({ summary: 'Test verification email sending' })
  @ApiQuery({ name: 'email', required: false, example: 'test@example.com' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent.' })
  async testVerification(@Query('email') email: string = 'test@example.com') {
    const code = '123456';
    await this.mailService.sendDynamicEmail(
      email,
      'Test User',
      EmailType.EMAIL_VERIFICATION,
      { code },
    );
    return { message: `Email de vérification envoyé à ${email}` };
  }

  @Get('test/password-reset')
  @ApiOperation({ summary: 'Test password reset email sending' })
  @ApiQuery({ name: 'email', required: false, example: 'test@example.com' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent.' })
  async testPasswordReset(@Query('email') email: string = 'test@example.com') {
    const code = '987654';
    await this.mailService.sendDynamicEmail(
      email,
      'Test User',
      EmailType.PASSWORD_RESET,
      { code },
    );
    return { message: `Email de réinitialisation envoyé à ${email}` };
  }

  @Get('test/password-change')
  @ApiOperation({ summary: 'Test password change email sending' })
  @ApiQuery({ name: 'email', required: false, example: 'test@example.com' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent.' })
  async testPasswordChange(@Query('email') email: string = 'test@example.com') {
    const code = '456789';
    await this.mailService.sendDynamicEmail(
      email,
      'Test User',
      EmailType.PASSWORD_CHANGE,
      { code },
    );
    return { message: `Email de changement de mot de passe envoyé à ${email}` };
  }

  @Get('test/confirmation')
  @ApiOperation({ summary: 'Test password changed confirmation email sending' })
  @ApiQuery({ name: 'email', required: false, example: 'test@example.com' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent.' })
  async testConfirmation(@Query('email') email: string = 'test@example.com') {
    await this.mailService.sendDynamicEmail(
      email,
      'Test User',
      EmailType.PASSWORD_CHANGED_CONFIRMATION,
    );
    return { message: `Email de confirmation envoyé à ${email}` };
  }

  @Get('test/welcome')
  @ApiOperation({ summary: 'Test welcome email sending' })
  @ApiQuery({ name: 'email', required: false, example: 'test@example.com' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent.' })
  async testWelcome(@Query('email') email: string = 'test@example.com') {
    await this.mailService.sendDynamicEmail(
      email,
      'Test User',
      EmailType.WELCOME,
      {
        ctaLink: 'https://example.com/profile',
      },
    );
    return { message: `Email de bienvenue envoyé à ${email}` };
  }
}

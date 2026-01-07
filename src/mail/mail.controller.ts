import { Controller, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { EmailType } from './types/email.types';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test/verification')
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
  async testConfirmation(@Query('email') email: string = 'test@example.com') {
    await this.mailService.sendDynamicEmail(
      email,
      'Test User',
      EmailType.PASSWORD_CHANGED_CONFIRMATION,
    );
    return { message: `Email de confirmation envoyé à ${email}` };
  }

  @Get('test/welcome')
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

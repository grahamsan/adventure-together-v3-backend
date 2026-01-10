import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Otp } from './entities/otp.entity';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from '../mail/mail.service';
import { EmailType } from '../mail/types/email.types';
import { normalizeUserRole } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
  ) {}

  // Valide user pour login (compare password)
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    // findByEmail peut renvoyer null
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  // login : renvoie un JWT (access token)
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = { sub: user.id, role: user.role };
    const secret = this.config.get<string>('JWT_SECRET') || 'changeme';
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') || '7d';

    const accessToken = this.jwtService.sign(payload, { secret, expiresIn });

    return {
      accessToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: normalizeUserRole(user.role),
      },
    };
  }

  // register : délègue à UserService.create (NE PAS hasher ici)
  async register(registerDto: RegisterDto) {
    // userService.create effectue le hashage (comme tu l'as déjà)
    const user = await this.usersService.create(registerDto as any);
    // On peut retourner un token directement si tu veux
    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: normalizeUserRole(user.role),
      },
      accessToken: token,
    };
  }

  // helper to verify token and return minimal user claim (optionnel)
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET') || 'changeme',
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // --- Vérification d'email ---
  async sendVerificationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const otp = this.otpRepo.create({ user, code });
    await this.otpRepo.save(otp);

    await this.mailService.sendDynamicEmail(
      email,
      this.usersService.getDisplayName(user),
      EmailType.EMAIL_VERIFICATION,
      { code },
    );

    return { message: 'Code envoyé à votre adresse e-mail' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.otpRepo.findOne({
      where: { user: { id: user.id }, code: dto.code, isUsed: false },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    otp.isUsed = true;
    await this.otpRepo.save(otp);

    user.isEmailVerified = true;
    await this.usersService.update(user.id, {});

    return { message: 'Email vérifié avec succès' };
  }

  // --- Mot de passe oublié ---
  async requestPasswordReset(dto: RequestResetDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const otp = this.otpRepo.create({ user, code });
    await this.otpRepo.save(otp);

    await this.mailService.sendDynamicEmail(
      dto.email,
      this.usersService.getDisplayName(user),
      EmailType.PASSWORD_RESET,
      { code },
    );

    return {
      message: 'Code de réinitialisation envoyé à votre adresse e-mail',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.otpRepo.findOne({
      where: { user: { id: user.id }, code: dto.code, isUsed: false },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    otp.isUsed = true;
    await this.otpRepo.save(otp);

    await this.usersService.update(user.id, { password: dto.newPassword });

    // Envoyer email de confirmation
    await this.mailService.sendDynamicEmail(
      dto.email,
      this.usersService.getDisplayName(user),
      EmailType.PASSWORD_CHANGED_CONFIRMATION,
    );

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // --- Changement de mot de passe (utilisateur connecté) ---
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    // Vérifier que l'ancien mot de passe est correct
    const matches = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!matches) {
      throw new BadRequestException('Ancien mot de passe incorrect');
    }

    // Générer et envoyer un code de vérification
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const otp = this.otpRepo.create({ user, code });
    await this.otpRepo.save(otp);

    await this.mailService.sendDynamicEmail(
      user.email,
      this.usersService.getDisplayName(user),
      EmailType.PASSWORD_CHANGE,
      { code },
    );

    return {
      message: 'Code de vérification envoyé à votre adresse e-mail',
      requiresVerification: true,
    };
  }

  async confirmPasswordChange(
    userId: string,
    code: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.otpRepo.findOne({
      where: { user: { id: user.id }, code, isUsed: false },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    otp.isUsed = true;
    await this.otpRepo.save(otp);

    await this.usersService.update(user.id, { password: newPassword });

    // Envoyer email de confirmation
    await this.mailService.sendDynamicEmail(
      user.email,
      this.usersService.getDisplayName(user),
      EmailType.PASSWORD_CHANGED_CONFIRMATION,
    );

    return { message: 'Mot de passe changé avec succès' };
  }
}

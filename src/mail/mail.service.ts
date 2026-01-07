import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import { EmailType, EmailConfig } from './types/email.types';

interface EmailVariables {
  userName?: string;
  companyName?: string;
  ctaLink?: string;
  ctaText?: string;
  helpCenterLink?: string;
  privacyPolicyLink?: string;
  unsubscribeLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  instagramLink?: string;
  year?: number;
  companyAddress?: string;
  icon?: string;
  code?: string;
  [key: string]: any;
}

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  private emailTemplate: string;
  private emailConfigs: Map<EmailType, EmailConfig>;

  constructor() {
    // Charger le template HTML au démarrage
    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'email-template.html',
    );
    try {
      this.emailTemplate = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      console.error('Erreur lors du chargement du template email:', error);
      this.emailTemplate = this.getDefaultTemplate();
    }

    // Initialiser les configurations d'email
    this.emailConfigs = new Map<EmailType, EmailConfig>([
      [
        EmailType.EMAIL_VERIFICATION,
        {
          subject: '✉️ Vérifiez votre adresse email',
          icon: '✉️',
          message:
            'Merci de vous être inscrit ! Veuillez utiliser le code de vérification ci-dessous pour vérifier votre adresse email et compléter votre inscription.',
          includeCode: true,
          showInfoNote: true,
          infoMessage: 'Ce code expire dans 15 minutes pour votre sécurité.',
        },
      ],
      [
        EmailType.PASSWORD_RESET,
        {
          subject: '🔑 Réinitialisez votre mot de passe',
          icon: '🔑',
          message:
            'Nous avons reçu une demande de réinitialisation de votre mot de passe. Veuillez utiliser le code ci-dessous pour continuer.',
          includeCode: true,
          showSecurityNote: true,
          showInfoNote: true,
          infoMessage: 'Ce code expire dans 15 minutes.',
        },
      ],
      [
        EmailType.PASSWORD_CHANGE,
        {
          subject: '🔐 Confirmez le changement de mot de passe',
          icon: '🔐',
          message:
            'Vous avez demandé à changer votre mot de passe. Veuillez utiliser le code ci-dessous pour confirmer ce changement.',
          includeCode: true,
          showSecurityNote: true,
          showInfoNote: true,
          infoMessage: 'Ce code expire dans 15 minutes.',
        },
      ],
      [
        EmailType.PASSWORD_CHANGED_CONFIRMATION,
        {
          subject: '✅ Votre mot de passe a été changé',
          icon: '✅',
          message:
            "Votre mot de passe a été changé avec succès. Si vous n'avez pas effectué cette action, veuillez contacter notre support immédiatement.",
          showSecurityNote: true,
        },
      ],
      [
        EmailType.WELCOME,
        {
          subject: '🎉 Bienvenue sur AdventureTogether !',
          icon: '🎉',
          message:
            "Bienvenue sur AdventureTogether ! Nous sommes ravis de vous compter parmi nous. Préparez-vous à entrer en contact avec d'autres voyageurs, à partager des trajets et à rendre vos voyages plus mémorables.",
          ctaText: 'Compléter votre profil',
        },
      ],
    ]);
  }

  /**
   * Remplace les variables dans le template
   */
  private populateTemplate(
    template: string,
    variables: EmailVariables,
  ): string {
    let result = template;

    // Valeurs par défaut
    const defaults: EmailVariables = {
      companyName: process.env.APP_NAME || 'AdventureTogether',
      helpCenterLink: `${process.env.APP_URL || 'https://yourapp.com'}/help`,
      privacyPolicyLink: `${process.env.APP_URL || 'https://yourapp.com'}/privacy`,
      unsubscribeLink: `${process.env.APP_URL || 'https://yourapp.com'}/unsubscribe`,
      facebookLink: '#',
      twitterLink: '#',
      instagramLink: '#',
      year: new Date().getFullYear(),
      companyAddress: '123 Adventure Lane, Travel City, TC 54321',
      ctaText: 'Commencer',
      ...variables,
    };

    // Remplacer toutes les variables
    for (const [key, value] of Object.entries(defaults)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Template HTML par défaut (inline)
   */
  private getDefaultTemplate(): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px; line-height: 1.6; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header-banner { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 150px; width: 100%; display: flex; align-items: center; justify-content: center; }
        .header-icon { font-size: 60px; color: white; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
        .message { color: #4b5563; font-size: 15px; line-height: 1.8; margin-bottom: 30px; }
        .code-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; }
        .code { font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .code-label { margin-top: 10px; color: #6b7280; font-size: 13px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-weight: 600; font-size: 15px; }
        .button-container { text-align: center; margin: 30px 0; }
        .info-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-box p { color: #92400e; font-size: 14px; margin: 0; }
        .security-note { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .security-note p { color: #991b1b; font-size: 14px; margin: 0; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-links { margin-bottom: 20px; }
        .footer-links a { color: #6b7280; text-decoration: none; margin: 0 15px; font-size: 13px; }
        .copyright { color: #9ca3af; font-size: 12px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header-banner">
            <div class="header-icon">{{icon}}</div>
        </div>
        <div class="content">
            <h1 class="greeting">Bonjour {{userName}},</h1>
            <p class="message">{{message}}</p>
            {{codeSection}}
            {{ctaSection}}
            {{infoSection}}
            {{securitySection}}
        </div>
        <div class="footer">
            <div class="footer-links">
                <a href="{{helpCenterLink}}">Centre d'aide</a>
                <a href="{{privacyPolicyLink}}">Politique de confidentialité</a>
            </div>
            <div class="copyright">© {{year}} {{companyName}}. Tous droits réservés.</div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Envoyer un email dynamique basé sur le type
   */
  async sendDynamicEmail(
    to: string,
    userName: string,
    emailType: EmailType,
    options?: {
      code?: string;
      ctaLink?: string;
      customMessage?: string;
    },
  ) {
    const config = this.emailConfigs.get(emailType);
    if (!config) {
      throw new Error(`Email configuration not found for type: ${emailType}`);
    }

    const variables: EmailVariables = {
      userName,
      message: options?.customMessage || config.message,
      icon: config.icon,
    };

    if (options?.code && config.includeCode) {
      variables.code = options.code;
    }

    if (options?.ctaLink && config.ctaText) {
      variables.ctaLink = options.ctaLink;
      variables.ctaText = config.ctaText;
    }

    let htmlContent = this.populateTemplate(this.emailTemplate, variables);

    // Gérer les sections optionnelles
    const codeSection =
      options?.code && config.includeCode
        ? `<div class="code-box">
           <div class="code">${options.code}</div>
           <p class="code-label">${config.infoMessage || 'Ce code expire dans 15 minutes'}</p>
         </div>`
        : '';

    const ctaSection =
      options?.ctaLink && config.ctaText
        ? `<div class="button-container">
           <a href="${options.ctaLink}" class="cta-button">${config.ctaText}</a>
         </div>`
        : '';

    const infoSection =
      config.showInfoNote && config.infoMessage && !options?.code
        ? `<div class="info-box">
           <p>${config.infoMessage}</p>
         </div>`
        : '';

    const securitySection = config.showSecurityNote
      ? `<div class="security-note">
           <p>⚠️ Si vous n'avez pas demandé cette action, veuillez ignorer cet email et contacter notre support immédiatement.</p>
         </div>`
      : '';

    htmlContent = htmlContent.replace('{{codeSection}}', codeSection);
    htmlContent = htmlContent.replace('{{ctaSection}}', ctaSection);
    htmlContent = htmlContent.replace('{{infoSection}}', infoSection);
    htmlContent = htmlContent.replace('{{securitySection}}', securitySection);

    const appName = process.env.APP_NAME || 'AdventureTogether';
    const mailUser = process.env.MAIL_USER || 'noreply@example.com';

    await this.transporter.sendMail({
      from: `"${appName}" <${mailUser}>`,
      to,
      subject: config.subject,
      html: htmlContent,
    });
  }

  /**
   * Envoyer un email simple (texte brut)
   */
  async sendMail(to: string, subject: string, text: string) {
    const appName = process.env.APP_NAME || 'Ton App';
    const mailUser = process.env.MAIL_USER || 'noreply@example.com';

    await this.transporter.sendMail({
      from: `"${appName}" <${mailUser}>`,
      to,
      subject,
      text,
    });
  }

  /**
   * Envoyer un email avec template HTML
   */
  async sendTemplatedEmail(
    to: string,
    subject: string,
    variables: EmailVariables,
  ) {
    let htmlContent = this.populateTemplate(this.emailTemplate, variables);

    // Gérer les sections optionnelles
    const codeSection = variables.code
      ? `<div class="code-box">
           <div class="code">${variables.code}</div>
           <p style="margin-top: 10px; color: #6b7280; font-size: 13px;">Ce code expire dans 15 minutes</p>
         </div>`
      : '';

    const ctaSection =
      variables.ctaLink && variables.ctaText
        ? `<div class="button-container">
           <a href="${variables.ctaLink}" class="cta-button">${variables.ctaText}</a>
         </div>`
        : '';

    htmlContent = htmlContent.replace('{{codeSection}}', codeSection);
    htmlContent = htmlContent.replace('{{ctaSection}}', ctaSection);

    const appName = process.env.APP_NAME || 'Ton App';
    const mailUser = process.env.MAIL_USER || 'noreply@example.com';

    await this.transporter.sendMail({
      from: `"${appName}" <${mailUser}>`,
      to,
      subject,
      html: htmlContent,
    });
  }

  /**
   * Email de bienvenue
   */
  async sendWelcomeEmail(to: string, userName: string, profileLink: string) {
    await this.sendTemplatedEmail(to, 'Bienvenue sur AdventureTogether !', {
      userName,
      message: `Bienvenue sur AdventureTogether ! Nous sommes ravis de vous compter parmi nous. Préparez-vous à entrer en contact avec d'autres voyageurs, à partager des trajets et à rendre vos voyages plus mémorables. Pour commencer et trouver votre première aventure, veuillez compléter votre profil.`,
      ctaLink: profileLink,
      ctaText: 'Compléter votre profil',
    });
  }

  /**
   * Email avec code de vérification (pour email ou reset password)
   */
  async sendVerificationCodeEmail(
    to: string,
    userName: string,
    code: string,
    purpose: 'email_verification' | 'password_reset',
  ) {
    const subject =
      purpose === 'email_verification'
        ? 'Vérifiez votre adresse email'
        : 'Réinitialisez votre mot de passe';

    const message =
      purpose === 'email_verification'
        ? `Merci de vous être inscrit ! Veuillez utiliser le code de vérification ci-dessous pour vérifier votre adresse email et compléter votre inscription.`
        : `Nous avons reçu une demande de réinitialisation de votre mot de passe. Veuillez utiliser le code ci-dessous pour continuer. Si vous n'avez pas demandé cela, vous pouvez ignorer cet email en toute sécurité.`;

    await this.sendTemplatedEmail(to, subject, {
      userName,
      message,
      code,
    });
  }

  /**
   * Email de confirmation d'action
   */
  async sendConfirmationEmail(
    to: string,
    userName: string,
    action: string,
    message: string,
  ) {
    await this.sendTemplatedEmail(to, action, {
      userName,
      message,
    });
  }

  /**
   * Email personnalisé
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    userName: string,
    message: string,
    ctaLink?: string,
    ctaText?: string,
    code?: string,
  ) {
    const variables: EmailVariables = {
      userName,
      message,
    };

    if (ctaLink && ctaText) {
      variables.ctaLink = ctaLink;
      variables.ctaText = ctaText;
    }

    if (code) {
      variables.code = code;
    }

    await this.sendTemplatedEmail(to, subject, variables);
  }
}

export enum EmailType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_CHANGED_CONFIRMATION = 'password_changed_confirmation',
  WELCOME = 'welcome',
}

export interface EmailConfig {
  subject: string;
  icon: string;
  message: string;
  includeCode?: boolean;
  ctaText?: string;
  ctaLink?: string;
  showSecurityNote?: boolean;
  showInfoNote?: boolean;
  infoMessage?: string;
}

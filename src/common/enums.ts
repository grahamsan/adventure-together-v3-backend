// Frontend-aligned roles with backward compatibility
export enum UserRole {
  // New frontend roles (source of truth)
  PARTICIPANT = 'Participant',
  ORGANIZER = 'Organizer',
  DRIVER = 'Driver',
  ADMIN = 'Admin',
  // Legacy roles (backward compatibility) - will map to new roles
  USER = 'user', // Maps to PARTICIPANT
  PROMOTER = 'promoter', // Maps to ORGANIZER
}

// Helper to normalize legacy roles to new roles
export function normalizeUserRole(role: UserRole | string): UserRole {
  const roleMap: Record<string, UserRole> = {
    user: UserRole.PARTICIPANT,
    promoter: UserRole.ORGANIZER,
    Participant: UserRole.PARTICIPANT,
    Organizer: UserRole.ORGANIZER,
    Driver: UserRole.DRIVER,
    Admin: UserRole.ADMIN,
  };
  return roleMap[role] || (role as UserRole);
}

// Organizer sub-type (Individual or Company)
export enum OrganizerType {
  INDIVIDUAL = 'Individual',
  COMPANY = 'Company',
}

// User account status
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum ActivityType {
  ROAD_TRIP = 'road-trip',
  EVENT = 'event',
}

export enum TripStatus {
  FILLING = 'filling',
  INCOMING = 'incoming',
  DONE = 'done',
}

export enum RequestStatus {
  PENDING = 'pending',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
}

export enum ConversationType {
  GROUP = 'group',
  USER2USER = 'user2user',
}

export enum PlaceType {
  VILLE = 'Ville',
  MUSEE = 'Musée',
  PARC = 'Parc',
  HOTEL = 'Hotel',
  MONUMENT = 'Monument',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export enum NotificationType {
  TRIP = 'trip',
  MESSAGE = 'message',
  REMINDER = 'reminder',
}

export enum ReportStatus {
  NEW = 'Nouveau',
  PROCESSED = 'Traité',
}

export enum ReportEntityType {
  EXPERIENCE = 'Expérience',
  TRIP = 'Trajet',
  USER = 'Utilisateur',
  LIEU = 'Lieu',
  COMMENTAIRE = 'Commentaire',
}

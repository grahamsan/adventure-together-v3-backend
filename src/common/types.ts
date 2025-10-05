// types.ts
export interface CarpoolingInfo {
    carBrand?: string;
    carModel?: string;
    carPlaces?: number;
    carImmatriculation?: string;
    photos?: string[]; // urls
    contactPhone?: string;
    notes?: string;
  }
  
  export interface MeetingPoint {
    longitude: number;
    latitude: number;
    city?: string;
    neighborhood?: string;
    description?: string;
  }
  
  export interface NotificationAction {
    // permet au front d'ouvrir une route précise
    targetRoute?: string; // ex: '/activities/:id' ou 'activity.detail'
    params?: Record<string, any>; // ex: { activityId: 'uuid' }
    url?: string; // lien externe si besoin
  }
  
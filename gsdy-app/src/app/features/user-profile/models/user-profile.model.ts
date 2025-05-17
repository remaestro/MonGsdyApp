/**
 * Modèle représentant un profil utilisateur
 */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: Address;
  preferences: {
    language: 'fr' | 'en';
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    theme?: 'light' | 'dark';
  }
}

/**
 * Modèle représentant une adresse
 */
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

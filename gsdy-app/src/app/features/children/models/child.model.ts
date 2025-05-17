export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  class: string; // Ex: "CP A", "CM2 B"
  birthDate: Date;
  photo?: string; // URL vers la photo de l'enfant
  // Autres informations pertinentes: allergies, personne à contacter en cas d'urgence, etc.
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  parentId: string; // Assurez-vous que ce champ est présent et utilisé
  classId?: string; // L'identifiant de la classe de l'enfant
  // Ajoutez d'autres champs pertinents pour un enfant
  // Par exemple : allergies, notes médicales, personne à contacter en cas d'urgence, etc.
  photoUrl?: string; // URL vers une photo de l'enfant
  gender?: 'male' | 'female' | 'other';
}

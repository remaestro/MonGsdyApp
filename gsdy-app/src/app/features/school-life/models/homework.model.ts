export interface Homework {
  id: string;
  subject: string; // Matière (ex: "Mathématiques", "Français")
  title: string; // Titre ou description courte
  description?: string; // Description détaillée du devoir
  dueDate: Date; // Date d'échéance
  assignedDate: Date; // Date à laquelle le devoir a été donné
  isCompleted?: boolean; // Statut du devoir (fait/non fait)
  attachments?: { fileName: string; url: string }[]; // Pièces jointes éventuelles
  childId: string; // Pour lier le devoir à un enfant spécifique
}

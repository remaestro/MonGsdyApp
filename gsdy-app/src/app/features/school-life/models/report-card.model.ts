export interface ReportCard {
  id: string;
  childId: string;
  period: string; // Ex: "Trimestre 1", "Semestre 2", "Année 2024-2025"
  issueDate: Date;
  overallAppreciation?: string;
  subjects: SubjectGrade[];
  downloadUrl?: string; // Lien pour télécharger le bulletin en PDF
}

export interface SubjectGrade {
  subjectName: string;
  grade?: string | number; // Note (ex: "A", "15/20", 85)
  teacherAppreciation?: string;
  average?: string | number; // Moyenne de la classe pour cette matière (optionnel)
  coefficient?: number; // Ajout du coefficient
}

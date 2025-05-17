export interface StudentCountByLevel {
  level: string; // e.g., "CP", "CE1", "CM2"
  count: number;
}

export interface CanteenUsageStats {
  totalStudents: number;
  registeredForCanteen: number;
  registrationRate: number; // en pourcentage
  dailyAttendance?: {
    day: string; // e.g., "Lundi"
    count: number;
  }[];
}

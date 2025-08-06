export interface Project {
  id: string;
  userId: string; // Aggiunto per isolamento utenti
  title: string;
  category: string; // es. "lavoro", "famiglia", ...
  valenza: number; // 1-5 (importanza qualitativa)
  estHours: number; // float, stima tot ore
  priority: number; // 1-5 (urgenza)
  dueDate: string; // ISO
}

export interface AgendaBlock {
  id: string;
  userId: string; // Aggiunto per isolamento utenti
  projectId: string;
  start: string; // ISO
  end: string; // ISO
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export interface Database {
  users: User[];
  projects: Project[];
  agenda: AgendaBlock[];
}

export type EnergyLevel = 'low' | 'med' | 'high'; 
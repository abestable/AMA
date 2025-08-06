import path from 'path';
import fs from 'fs/promises';

const DB_PATH = path.join(process.cwd(), 'ama-planner.json');

export class DatabaseManager {
  private data: any = {
    users: [],
    projects: [],
    agenda: []
  };

  async init(): Promise<void> {
    try {
      // Try to load existing data
      try {
        const existingData = await fs.readFile(DB_PATH, 'utf-8');
        this.data = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist, start with empty data
        console.log('📁 Creating new JSON database file');
      }
    } catch (error) {
      throw error;
    }
  }

  async createTables(): Promise<void> {
    // JSON doesn't need table creation, but we ensure data structure
    if (!this.data.users) this.data.users = [];
    if (!this.data.projects) this.data.projects = [];
    if (!this.data.agenda) this.data.agenda = [];
    await this.save();
  }

  async migrateFromJSON(jsonPath: string): Promise<void> {
    try {
      const jsonData = await fs.readFile(jsonPath, 'utf-8');
      const data = JSON.parse(jsonData);
      
      // Merge data
      this.data.users = [...(this.data.users || []), ...(data.users || [])];
      this.data.projects = [...(this.data.projects || []), ...(data.projects || [])];
      this.data.agenda = [...(this.data.agenda || []), ...(data.agenda || [])];
      
      await this.save();
      console.log('✅ Migration from JSON completed successfully');
    } catch (error) {
      console.warn('⚠️ Migration failed:', error);
    }
  }

  private async save(): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2));
  }

  run(sql: string, params: any[] = []): any {
    // Simple SQL-like operations for JSON
    if (sql.includes('INSERT INTO users')) {
      const user = {
        id: params[0],
        email: params[1],
        passwordHash: params[2],
        createdAt: new Date().toISOString()
      };
      this.data.users.push(user);
      this.save();
      return { changes: 1 };
    }
    
    if (sql.includes('INSERT INTO projects')) {
      const project = {
        id: params[0],
        userId: params[1],
        title: params[2],
        category: params[3],
        valenza: params[4],
        estHours: params[5],
        priority: params[6],
        dueDate: params[7],
        createdAt: new Date().toISOString()
      };
      this.data.projects.push(project);
      this.save();
      return { changes: 1 };
    }
    
    if (sql.includes('INSERT INTO agenda')) {
      const agenda = {
        id: params[0],
        userId: params[1],
        projectId: params[2],
        start: params[3],
        end: params[4],
        createdAt: new Date().toISOString()
      };
      this.data.agenda.push(agenda);
      this.save();
      return { changes: 1 };
    }
    
    return { changes: 0 };
  }

  get(sql: string, params: any[] = []): any {
    if (sql.includes('SELECT * FROM users WHERE email')) {
      return this.data.users.find((u: any) => u.email === params[0]);
    }
    if (sql.includes('SELECT * FROM users WHERE id')) {
      return this.data.users.find((u: any) => u.id === params[0]);
    }
    return null;
  }

  all(sql: string, params: any[] = []): any[] {
    if (sql.includes('SELECT * FROM projects WHERE userId')) {
      return this.data.projects.filter((p: any) => p.userId === params[0]);
    }
    if (sql.includes('SELECT * FROM agenda WHERE userId')) {
      return this.data.agenda.filter((a: any) => a.userId === params[0]);
    }
    if (sql.includes('SELECT * FROM projects')) {
      return this.data.projects;
    }
    return [];
  }

  close(): void {
    // JSON doesn't need explicit closing
  }
}

export const database = new DatabaseManager(); 
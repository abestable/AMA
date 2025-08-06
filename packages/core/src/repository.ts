import { database } from './database';
import { Project, User, AgendaBlock } from './types';
import fs from 'fs/promises';
import path from 'path';

class Repository {
  constructor() {
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    try {
      await database.init();
      await database.createTables();
      
      // Migrate from JSON if exists
      const jsonPath = path.join(process.cwd(), 'apps/api/data.json');
      try {
        await fs.access(jsonPath);
        await database.migrateFromJSON(jsonPath);
      } catch {
        // JSON file doesn't exist, skip migration
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }

  // Database is already initialized in constructor

  // User operations
  async getUsers(): Promise<User[]> {
    return database.all('SELECT * FROM users ORDER BY createdAt DESC');
  }

  async getUserById(id: string): Promise<User | null> {
    return database.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return database.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID()
    };
    
    database.run(
      'INSERT INTO users (id, email, passwordHash) VALUES (?, ?, ?)',
      [newUser.id, newUser.email, newUser.passwordHash]
    );
    
    return newUser;
  }

  // Project operations
  async getProjects(userId?: string): Promise<Project[]> {
    if (userId) {
      return database.all('SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    }
    return database.all('SELECT * FROM projects ORDER BY createdAt DESC');
  }

  async getProjectById(id: string, userId?: string): Promise<Project | null> {
    if (userId) {
      return database.get('SELECT * FROM projects WHERE id = ? AND userId = ?', [id, userId]);
    }
    return database.get('SELECT * FROM projects WHERE id = ?', [id]);
  }

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID()
    };
    
    database.run(
      'INSERT INTO projects (id, userId, title, category, valenza, estHours, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newProject.id, newProject.userId, newProject.title, newProject.category, newProject.valenza, newProject.estHours, newProject.priority, newProject.dueDate]
    );
    
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Omit<Project, 'id'>>, userId?: string): Promise<Project | null> {
    // First check if project exists and user has permission
    const existingProject = await this.getProjectById(id, userId);
    if (!existingProject) {
      return null;
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title);
    }
    if (updates.category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(updates.category);
    }
    if (updates.valenza !== undefined) {
      updateFields.push('valenza = ?');
      updateValues.push(updates.valenza);
    }
    if (updates.estHours !== undefined) {
      updateFields.push('estHours = ?');
      updateValues.push(updates.estHours);
    }
    if (updates.priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(updates.priority);
    }
    if (updates.dueDate !== undefined) {
      updateFields.push('dueDate = ?');
      updateValues.push(updates.dueDate);
    }

    if (updateFields.length === 0) {
      return existingProject;
    }

    const sql = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);

    database.run(sql, updateValues);
    
    return await this.getProjectById(id, userId);
  }

  async deleteProject(id: string, userId?: string): Promise<boolean> {
    const existingProject = await this.getProjectById(id, userId);
    if (!existingProject) {
      return false;
    }

    const result = database.run('DELETE FROM projects WHERE id = ?', [id]);
    return result.changes > 0;
  }

  // Agenda operations
  async getAgenda(userId?: string): Promise<AgendaBlock[]> {
    if (userId) {
      return database.all('SELECT * FROM agenda WHERE userId = ? ORDER BY start ASC', [userId]);
    }
    return database.all('SELECT * FROM agenda ORDER BY start ASC');
  }

  async createAgendaBlocks(blocks: Omit<AgendaBlock, 'id'>[]): Promise<AgendaBlock[]> {
    const newBlocks: AgendaBlock[] = [];
    
    for (const block of blocks) {
      const newBlock: AgendaBlock = {
        ...block,
        id: crypto.randomUUID()
      };
      
      database.run(
        'INSERT INTO agenda (id, userId, projectId, start, end) VALUES (?, ?, ?, ?, ?)',
        [newBlock.id, newBlock.userId, newBlock.projectId, newBlock.start, newBlock.end]
      );
      
      newBlocks.push(newBlock);
    }
    
    return newBlocks;
  }

  async deleteAgendaBlocks(userId?: string): Promise<void> {
    if (userId) {
      database.run('DELETE FROM agenda WHERE userId = ?', [userId]);
    } else {
      database.run('DELETE FROM agenda');
    }
  }
}

export const repository = new Repository(); 
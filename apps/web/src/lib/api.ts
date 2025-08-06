import type { Project, AgendaBlock, EnergyLevel } from '@ama-planner/core';

const API_BASE = 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  // Auth
  async register(email: string, password: string) {
    return this.request<{ token: string; user: { id: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: { id: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Projects
  async getProjects() {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string) {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(project: Omit<Project, 'id'>) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  }

  async updateProject(id: string, updates: Partial<Omit<Project, 'id'>>) {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteProject(id: string) {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Planning
  async generatePlan(horizonHours: number, energy: EnergyLevel) {
    return this.request<{ blocks: AgendaBlock[]; totalHours: number }>('/plan/generate', {
      method: 'POST',
      body: JSON.stringify({ horizonHours, energy })
    });
  }

  async confirmPlan(blocks: Omit<AgendaBlock, 'id'>[]) {
    return this.request<AgendaBlock[]>('/plan/confirm', {
      method: 'POST',
      body: JSON.stringify({ blocks })
    });
  }
}

export const api = new ApiClient(); 
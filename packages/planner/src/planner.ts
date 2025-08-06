import { Project, AgendaBlock, EnergyLevel } from '@ama-planner/core';

export interface PlanningParams {
  projects: Project[];
  horizonHours: number;
  energy: EnergyLevel;
  userId: string;
}

export interface PlanningResult {
  blocks: AgendaBlock[];
  totalHours: number;
}

export async function planAgenda(params: PlanningParams): Promise<PlanningResult> {
  const { projects, horizonHours, energy } = params;
  
  // Check if Gemini is available
  const geminiKey = process.env.GEMINI_KEY;
  if (geminiKey) {
    try {
      return await planWithGemini(params);
    } catch (error) {
      console.warn('Gemini planning failed, falling back to stub:', error);
    }
  }
  
  return planWithStub(params);
}

function planWithStub(params: PlanningParams): PlanningResult {
  const { projects, horizonHours, energy } = params;
  
  // Sort projects: priority desc → valenza desc → dueDate asc
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // desc
    }
    if (a.valenza !== b.valenza) {
      return b.valenza - a.valenza; // desc
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); // asc
  });

  const blocks: AgendaBlock[] = [];
  let currentTime = new Date();
  let totalHours = 0;

  // Energy multiplier
  const energyMultiplier = {
    low: 0.7,
    med: 1.0,
    high: 1.3
  }[energy];

  for (const project of sortedProjects) {
    if (totalHours >= horizonHours) break;
    
    const adjustedHours = project.estHours * energyMultiplier;
    const slots = Math.ceil(adjustedHours * 2); // 30-minute slots
    
    for (let i = 0; i < slots && totalHours < horizonHours; i++) {
      const start = new Date(currentTime);
      const end = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30 minutes
      
      blocks.push({
        id: crypto.randomUUID(),
        userId: params.userId,
        projectId: project.id,
        start: start.toISOString(),
        end: end.toISOString()
      });
      
      currentTime = end;
      totalHours += 0.5;
    }
  }

  return { blocks, totalHours };
}

async function planWithGemini(params: PlanningParams): Promise<PlanningResult> {
  // Gemini integration (commented out but ready to use)
  /*
  import { VertexAI } from "@google-cloud/vertexai";
  
  const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: "us-central1",
  });
  
  const model = vertexAI.preview.getGenerativeModel({
    model: "gemini-1.5-pro",
  });
  
  const prompt = `Plan an agenda for the next ${params.horizonHours} hours with energy level ${params.energy}.
  
  Projects:
  ${params.projects.map(p => `- ${p.title} (${p.estHours}h, priority: ${p.priority}, valenza: ${p.valenza}, due: ${p.dueDate})`).join('\n')}
  
  Return a JSON array of agenda blocks with start and end times in ISO format.`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Parse response and convert to blocks
  // This is a simplified version - you'd need proper JSON parsing
  const blocks: AgendaBlock[] = [];
  
  return { blocks, totalHours: 0 };
  */
  
  // Fallback to stub for now
  return planWithStub(params);
} 
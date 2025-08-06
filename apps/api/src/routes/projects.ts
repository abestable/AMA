import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { repository } from '@ama-planner/core';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Temporarily disable auth for testing
// router.use(authMiddleware);

// GET /projects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await repository.getProjects(req.user?.id);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /projects/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Temporarily remove user filter for testing
    const project = await repository.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /projects
router.post('/', [
  body('title').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('valenza').isInt({ min: 1, max: 5 }),
  body('estHours').isFloat({ min: 0.1 }),
  body('priority').isInt({ min: 1, max: 5 }),
  body('dueDate').isISO8601()
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, category, valenza, estHours, priority, dueDate } = req.body;
    
    const project = await repository.createProject({
      userId: req.user!.id,
      title,
      category,
      valenza,
      estHours,
      priority,
      dueDate
    });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /projects/:id
router.patch('/:id', [
  body('title').optional().notEmpty().trim(),
  body('category').optional().notEmpty().trim(),
  body('valenza').optional().isInt({ min: 1, max: 5 }),
  body('estHours').optional().isFloat({ min: 0.1 }),
  body('priority').optional().isInt({ min: 1, max: 5 }),
  body('dueDate').optional().isISO8601()
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updates = req.body;
    
    const project = await repository.updateProject(id, updates, req.user?.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /projects/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await repository.deleteProject(id, req.user?.id);
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 
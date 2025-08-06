import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { repository } from '@ama-planner/core';
import { planAgenda } from '@ama-planner/planner';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /plan/generate
router.post('/generate', [
  body('horizonHours').isInt({ min: 1, max: 168 }),
  body('energy').isIn(['low', 'med', 'high'])
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { horizonHours, energy } = req.body;
    
    // Get user's projects only
    const projects = await repository.getProjects(req.user?.id);
    
    // Generate plan
    const result = await planAgenda({
      projects,
      horizonHours,
      energy,
      userId: req.user!.id
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /plan/confirm
router.post('/confirm', [
  body('blocks').isArray(),
  body('blocks.*.projectId').notEmpty(),
  body('blocks.*.start').isISO8601(),
  body('blocks.*.end').isISO8601()
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { blocks } = req.body;
    
    // Clear existing agenda for this user
    await repository.deleteAgendaBlocks(req.user?.id);
    
    // Save new blocks
    const savedBlocks = await repository.createAgendaBlocks(blocks);
    
    res.status(201).json(savedBlocks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 
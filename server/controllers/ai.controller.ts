import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

export const aiController = {
  copilot: async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }
      const response = await aiService.copilot(message);
      res.json({ response });
    } catch (e: any) {
      console.error('AI Copilot error:', e);
      res.status(500).json({ error: e.message });
    }
  },

  matchmaker: async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
      }
      const result = await aiService.matchmaker(prompt);
      res.json(result);
    } catch (e: any) {
      console.error('AI Matchmaker error:', e);
      res.status(500).json({ error: e.message });
    }
  },

  analytics: async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query) {
        res.status(400).json({ error: 'Query is required' });
        return;
      }
      const result = await aiService.analytics(query);
      res.json(result);
    } catch (e: any) {
      console.error('AI Analytics error:', e);
      res.status(500).json({ error: e.message });
    }
  },
};

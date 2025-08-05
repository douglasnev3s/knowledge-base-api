import { Router } from 'express';
import userRoutes from './userRoutes';

const router = Router();

router.use('/users', userRoutes);

router.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Knowledge Base API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
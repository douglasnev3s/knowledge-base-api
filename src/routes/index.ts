import { Router } from 'express';
import userRoutes from './userRoutes';
import topicRoutes from './topicRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/topics', topicRoutes);

router.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Knowledge Base API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
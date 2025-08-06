import { Router } from 'express';
import userRoutes from './userRoutes';
import topicRoutes from './topicRoutes';
import resourceRoutes from './resourceRoutes';
import permissionRoutes from './permissionRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/topics', topicRoutes);
router.use('/resources', resourceRoutes);
router.use('/permissions', permissionRoutes);

router.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Knowledge Base API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
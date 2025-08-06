import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { AuthMiddleware } from '../middleware/authMiddleware';

const router = Router();
const permissionController = new PermissionController();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.authenticate);

router.get('/check', permissionController.checkUserPermissions);

export default router;
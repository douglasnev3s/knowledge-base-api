import { Router } from 'express';
import { ResourceController } from '../controllers/ResourceController';
import { AuthMiddleware } from '../middleware/authMiddleware';
import { PermissionAction } from '../models/interfaces';

const router = Router();
const resourceController = new ResourceController();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.authenticate);

router.get('/', AuthMiddleware.requirePermission(PermissionAction.VIEW_RESOURCES), resourceController.getAllResources);
router.get('/:id', AuthMiddleware.requirePermission(PermissionAction.VIEW_RESOURCES), resourceController.getResourceById);
router.post('/', AuthMiddleware.requirePermission(PermissionAction.CREATE_RESOURCES), resourceController.createResource);
router.put('/:id', AuthMiddleware.requirePermission(PermissionAction.UPDATE_RESOURCES), resourceController.updateResource);
router.delete('/:id', AuthMiddleware.requirePermission(PermissionAction.DELETE_RESOURCES), resourceController.deleteResource);
router.get('/topic/:topicId', AuthMiddleware.requirePermission(PermissionAction.VIEW_RESOURCES), resourceController.getResourcesByTopic);
router.get('/type/:type', AuthMiddleware.requirePermission(PermissionAction.VIEW_RESOURCES), resourceController.getResourcesByType);

export default router;
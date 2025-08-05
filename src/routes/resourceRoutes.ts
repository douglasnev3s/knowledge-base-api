import { Router } from 'express';
import { ResourceController } from '../controllers/ResourceController';

const router = Router();
const resourceController = new ResourceController();

router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', resourceController.createResource);
router.put('/:id', resourceController.updateResource);
router.delete('/:id', resourceController.deleteResource);
router.get('/topic/:topicId', resourceController.getResourcesByTopic);
router.get('/type/:type', resourceController.getResourcesByType);

export default router;
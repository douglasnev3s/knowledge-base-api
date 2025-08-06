import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';
import { AuthMiddleware } from '../middleware/authMiddleware';
import { PermissionAction } from '../models/interfaces';

const router = Router();
const topicController = new TopicController();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.authenticate);

router.get('/', AuthMiddleware.requirePermission(PermissionAction.VIEW_TOPICS), topicController.getAllTopics);
router.get('/:id', AuthMiddleware.requirePermission(PermissionAction.VIEW_TOPICS), topicController.getTopicById);
router.post('/', AuthMiddleware.requirePermission(PermissionAction.CREATE_TOPICS), topicController.createTopic);
router.put('/:id', AuthMiddleware.requirePermission(PermissionAction.UPDATE_TOPICS), topicController.updateTopic);
router.delete('/:id', AuthMiddleware.requirePermission(PermissionAction.DELETE_TOPICS), topicController.deleteTopic);
router.get('/:id/versions', AuthMiddleware.requirePermission(PermissionAction.VIEW_TOPIC_VERSIONS), topicController.getTopicVersions);
router.get('/:id/versions/:version', AuthMiddleware.requirePermission(PermissionAction.VIEW_TOPIC_VERSIONS), topicController.getTopicVersion);
router.get('/:id/tree', AuthMiddleware.requirePermission(PermissionAction.ACCESS_TOPIC_TREE), topicController.getTopicTree);
router.get('/path/:startId/:endId', AuthMiddleware.requirePermission(PermissionAction.ACCESS_SHORTEST_PATH), topicController.getShortestPath);

export default router;
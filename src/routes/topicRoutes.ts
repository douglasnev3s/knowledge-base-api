import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';

const router = Router();
const topicController = new TopicController();

router.get('/', topicController.getAllTopics);
router.get('/:id', topicController.getTopicById);
router.post('/', topicController.createTopic);
router.put('/:id', topicController.updateTopic);
router.delete('/:id', topicController.deleteTopic);
router.get('/:id/versions', topicController.getTopicVersions);
router.get('/:id/versions/:version', topicController.getTopicVersion);
router.get('/:id/tree', topicController.getTopicTree);

export default router;
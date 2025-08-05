import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';

const router = Router();
const topicController = new TopicController();

router.get('/', topicController.getAllTopics);
router.get('/:id', topicController.getTopicById);
router.post('/', topicController.createTopic);
router.put('/:id', topicController.updateTopic);
router.delete('/:id', topicController.deleteTopic);

export default router;
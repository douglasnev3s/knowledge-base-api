import { Request, Response } from 'express';
import { TopicService } from '../services/TopicService';
import { ICreateTopicDto, IUpdateTopicDto, ITopicPath } from '../models/interfaces';

export class TopicController {
  private topicService: TopicService;

  constructor(topicService?: TopicService) {
    this.topicService = topicService || new TopicService();
  }

  // GET /topics
  getAllTopics = async (_req: Request, res: Response): Promise<void> => {
    try {
      const topics = await this.topicService.getAllTopics();
      res.json({
        success: true,
        data: topics,
        count: topics.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching topics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /topics/:id
  getTopicById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const topic = await this.topicService.getTopicById(id);

      res.json({
        success: true,
        data: topic
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error fetching topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /topics
  createTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const topicData: ICreateTopicDto = req.body;
      const newTopic = await this.topicService.createTopic(topicData);

      res.status(201).json({
        success: true,
        data: newTopic,
        message: 'Topic created successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('must be provided')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }

        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error creating topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // PUT /topics/:id
  updateTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: IUpdateTopicDto = req.body;
      const updatedTopic = await this.topicService.updateTopic(id, updateData);

      res.json({
        success: true,
        data: updatedTopic,
        message: 'Topic updated successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('Circular') || error.message.includes('must be provided')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }

        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error updating topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // DELETE /topics/:id
  deleteTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.topicService.deleteTopic(id);

      res.json({
        success: true,
        message: 'Topic deleted successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error deleting topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /topics/:id/versions
  getTopicVersions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const versions = await this.topicService.getTopicVersions(id);
      const topic = await this.topicService.getTopicById(id);

      res.json({
        success: true,
        data: versions,
        count: versions.length,
        currentVersion: topic.version
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error fetching topic versions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /topics/:id/versions/:version
  getTopicVersion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, version } = req.params;
      const versionNumber = parseInt(version);
      const topicVersion = await this.topicService.getTopicVersion(id, versionNumber);

      res.json({
        success: true,
        data: topicVersion
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }

        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error fetching topic version',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /topics/:id/tree
  getTopicTree = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const topicTree = await this.topicService.getTopicTree(id);

      const totalTopics = this.topicService.countTopicsInTree(topicTree);

      res.json({
        success: true,
        data: topicTree,
        metadata: {
          totalTopics: totalTopics,
          depth: this.topicService.calculateTreeDepth(topicTree),
          hasChildren: topicTree.children.length > 0
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error building topic tree',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /topics/path/:startId/:endId
  getShortestPath = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startId, endId } = req.params;
      const pathResult: ITopicPath = await this.topicService.getShortestPath(startId, endId);

      if (!pathResult.found) {
        res.status(404).json({
          success: false,
          message: 'No path found between the specified topics',
          data: {
            startTopicId: startId,
            endTopicId: endId,
            searched: true
          }
        });
        return;
      }

      res.json({
        success: true,
        data: pathResult,
        message: `Shortest path found with distance ${pathResult.distance}`
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('required')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error finding shortest path',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
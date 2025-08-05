import { Request, Response } from 'express';
import { TopicRepository } from '../repositories/TopicRepository';
import { ICreateTopicDto, IUpdateTopicDto } from '../models/interfaces';

export class TopicController {
  private topicRepository: TopicRepository;

  constructor() {
    this.topicRepository = new TopicRepository();
  }

  // GET /topics
  getAllTopics = async (_req: Request, res: Response): Promise<void> => {
    try {
      const topics = await this.topicRepository.findAll();
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
      const topic = await this.topicRepository.findById(id);
      
      if (!topic) {
        res.status(404).json({
          success: false,
          message: 'Topic not found'
        });
        return;
      }

      res.json({
        success: true,
        data: topic
      });
    } catch (error) {
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
      
      if (!topicData.name || !topicData.content) {
        res.status(400).json({
          success: false,
          message: 'Name and content are required'
        });
        return;
      }

      const newTopic = await this.topicRepository.create(topicData);
      
      res.status(201).json({
        success: true,
        data: newTopic,
        message: 'Topic created successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Parent topic not found') {
        res.status(404).json({
          success: false,
          message: 'Parent topic not found'
        });
        return;
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

      if (!updateData.name && !updateData.content && updateData.parentTopicId === undefined) {
        res.status(400).json({
          success: false,
          message: 'At least one field (name, content, parentTopicId) must be provided'
        });
        return;
      }

      const updatedTopic = await this.topicRepository.update(id, updateData);
      
      if (!updatedTopic) {
        res.status(404).json({
          success: false,
          message: 'Topic not found'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedTopic,
        message: 'Topic updated successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Parent topic not found') {
          res.status(404).json({
            success: false,
            message: 'Parent topic not found'
          });
          return;
        }
        
        if (error.message === 'Circular reference detected') {
          res.status(400).json({
            success: false,
            message: 'Circular reference detected - cannot set parent topic'
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
      const deleted = await this.topicRepository.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Topic not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Topic deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
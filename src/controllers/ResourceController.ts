import { Request, Response } from 'express';
import { ResourceRepository } from '../repositories/ResourceRepository';
import { ICreateResourceDto, IUpdateResourceDto, ResourceType } from '../models/interfaces';

export class ResourceController {
  private resourceRepository: ResourceRepository;

  constructor() {
    this.resourceRepository = new ResourceRepository();
  }

  // GET /resources
  getAllResources = async (_req: Request, res: Response): Promise<void> => {
    try {
      const resources = await this.resourceRepository.findAll();
      res.json({
        success: true,
        data: resources,
        count: resources.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching resources',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /resources/:id
  getResourceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const resource = await this.resourceRepository.findById(id);
      
      if (!resource) {
        res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
        return;
      }

      res.json({
        success: true,
        data: resource
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching resource',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /resources
  createResource = async (req: Request, res: Response): Promise<void> => {
    try {
      const resourceData: ICreateResourceDto = req.body;
      
      if (!resourceData.topicId || !resourceData.url || !resourceData.description || !resourceData.type) {
        res.status(400).json({
          success: false,
          message: 'TopicId, url, description and type are required'
        });
        return;
      }

      if (!Object.values(ResourceType).includes(resourceData.type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid type. Must be video, article, pdf or link'
        });
        return;
      }

      try {
        new URL(resourceData.url);
      } catch {
        res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
        return;
      }

      const newResource = await this.resourceRepository.create(resourceData);
      
      res.status(201).json({
        success: true,
        data: newResource,
        message: 'Resource created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating resource',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // PUT /resources/:id
  updateResource = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: IUpdateResourceDto = req.body;

      if (!updateData.url && !updateData.description && !updateData.type) {
        res.status(400).json({
          success: false,
          message: 'At least one field (url, description, type) must be provided'
        });
        return;
      }

      if (updateData.type && !Object.values(ResourceType).includes(updateData.type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid type. Must be video, article, pdf or link'
        });
        return;
      }

      if (updateData.url) {
        try {
          new URL(updateData.url);
        } catch {
          res.status(400).json({
            success: false,
            message: 'Invalid URL format'
          });
          return;
        }
      }

      const updatedResource = await this.resourceRepository.update(id, updateData);
      
      if (!updatedResource) {
        res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedResource,
        message: 'Resource updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating resource',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // DELETE /resources/:id
  deleteResource = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.resourceRepository.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting resource',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /resources/topic/:topicId
  getResourcesByTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId } = req.params;
      const resources = await this.resourceRepository.findByTopicId(topicId);
      
      res.json({
        success: true,
        data: resources,
        count: resources.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching resources by topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /resources/type/:type
  getResourcesByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      
      if (!Object.values(ResourceType).includes(type as ResourceType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid type. Must be video, article, pdf or link'
        });
        return;
      }

      const resources = await this.resourceRepository.findByType(type);
      
      res.json({
        success: true,
        data: resources,
        count: resources.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching resources by type',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
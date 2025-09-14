import { Request, Response } from 'express';
import { ResourceService } from '../services/ResourceService';
import { ICreateResourceDto, IUpdateResourceDto, ResourceType } from '../models/interfaces';

export class ResourceController {
  private resourceService: ResourceService;

  constructor(resourceService?: ResourceService) {
    this.resourceService = resourceService || new ResourceService();
  }

  // GET /resources
  getAllResources = async (_req: Request, res: Response): Promise<void> => {
    try {
      const resources = await this.resourceService.getAllResources();
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
      const resource = await this.resourceService.getResourceById(id);

      res.json({
        success: true,
        data: resource
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
        message: 'Error fetching resource',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /resources
  createResource = async (req: Request, res: Response): Promise<void> => {
    try {
      const resourceData: ICreateResourceDto = req.body;
      const newResource = await this.resourceService.createResource(resourceData);

      res.status(201).json({
        success: true,
        data: newResource,
        message: 'Resource created successfully'
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
      const updatedResource = await this.resourceService.updateResource(id, updateData);

      res.json({
        success: true,
        data: updatedResource,
        message: 'Resource updated successfully'
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
        message: 'Error updating resource',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // DELETE /resources/:id
  deleteResource = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.resourceService.deleteResource(id);

      res.json({
        success: true,
        message: 'Resource deleted successfully'
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
        message: 'Error deleting resource',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /resources/topic/:topicId
  getResourcesByTopic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { topicId } = req.params;
      const resources = await this.resourceService.getResourcesByTopicId(topicId);

      res.json({
        success: true,
        data: resources,
        count: resources.length
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
        message: 'Error fetching resources by topic',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /resources/type/:type
  getResourcesByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      const resources = await this.resourceService.getResourcesByType(type as ResourceType);

      res.json({
        success: true,
        data: resources,
        count: resources.length
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error fetching resources by type',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
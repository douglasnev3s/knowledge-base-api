import { Request, Response } from 'express';
import { ResourceController } from '../../../controllers/ResourceController';
import { ResourceService } from '../../../services/ResourceService';
import { NotFoundError, ValidationError } from '../../../utils/errors/CustomErrors';
import { ResourceType } from '../../../models/interfaces';

// Mock the ResourceService
jest.mock('../../../services/ResourceService');

describe('ResourceController - Error Paths', () => {
  let resourceController: ResourceController;
  let mockResourceService: jest.Mocked<ResourceService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResourceService = {
      getAllResources: jest.fn(),
      getResourceById: jest.fn(),
      createResource: jest.fn(),
      updateResource: jest.fn(),
      deleteResource: jest.fn(),
      getResourcesByTopicId: jest.fn(),
      getResourcesByType: jest.fn()
    } as any;

    resourceController = new ResourceController(mockResourceService);

    mockRequest = {
      params: {},
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getResourceById - Error Cases', () => {
    it('should return 404 when resource is not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockResourceService.getResourceById.mockRejectedValue(new NotFoundError('Resource'));

      await resourceController.getResourceById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found'
      });
    });

    it('should return 500 on unexpected error', async () => {
      mockRequest.params = { id: 'some-id' };
      mockResourceService.getResourceById.mockRejectedValue(new Error('Database connection failed'));

      await resourceController.getResourceById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching resource',
        error: 'Database connection failed'
      });
    });
  });

  describe('createResource - Error Cases', () => {
    it('should return 400 when required fields are missing', async () => {
      mockRequest.body = {
        topicId: 'topic-id',
        url: 'https://example.com'
        // Missing description and type
      };
      mockResourceService.createResource.mockRejectedValue(
        new ValidationError('TopicId, URL, description and type are required')
      );

      await resourceController.createResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'TopicId, URL, description and type are required'
      });
    });

    it('should return 400 for invalid URL format', async () => {
      mockRequest.body = {
        topicId: 'topic-id',
        url: 'not-a-valid-url',
        description: 'Test description',
        type: ResourceType.ARTICLE
      };
      mockResourceService.createResource.mockRejectedValue(new ValidationError('Invalid URL format'));

      await resourceController.createResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid URL format'
      });
    });

    it('should return 400 for invalid resource type', async () => {
      mockRequest.body = {
        topicId: 'topic-id',
        url: 'https://example.com',
        description: 'Test description',
        type: 'invalid-type'
      };
      mockResourceService.createResource.mockRejectedValue(
        new ValidationError('Invalid resource type. Valid types are: video, article, pdf, link')
      );

      await resourceController.createResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid resource type. Valid types are: video, article, pdf, link'
      });
    });

    it('should return 404 when topic not found', async () => {
      mockRequest.body = {
        topicId: 'non-existent-topic',
        url: 'https://example.com',
        description: 'Test description',
        type: ResourceType.ARTICLE
      };
      mockResourceService.createResource.mockRejectedValue(new NotFoundError('Topic'));

      await resourceController.createResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topic not found'
      });
    });
  });

  describe('updateResource - Error Cases', () => {
    it('should return 400 when no fields provided for update', async () => {
      mockRequest.params = { id: 'resource-id' };
      mockRequest.body = {}; // No fields to update

      const validationError = new ValidationError('At least one field (topicId, url, description, type) must be provided');
      mockResourceService.updateResource.mockRejectedValue(validationError);

      await resourceController.updateResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'At least one field (topicId, url, description, type) must be provided'
      });
    });

    it('should return 404 when resource to update not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { description: 'Updated description' };
      mockResourceService.updateResource.mockRejectedValue(new NotFoundError('Resource'));

      await resourceController.updateResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found'
      });
    });

    it('should return 400 for invalid URL in update', async () => {
      mockRequest.params = { id: 'resource-id' };
      mockRequest.body = { url: 'invalid-url' };
      mockResourceService.updateResource.mockRejectedValue(new ValidationError('Invalid URL format'));

      await resourceController.updateResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid URL format'
      });
    });

    it('should return 400 for invalid type in update', async () => {
      mockRequest.params = { id: 'resource-id' };
      mockRequest.body = { type: 'invalid-type' };
      mockResourceService.updateResource.mockRejectedValue(
        new ValidationError('Invalid resource type. Valid types are: video, article, pdf, link')
      );

      await resourceController.updateResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid resource type. Valid types are: video, article, pdf, link'
      });
    });

    it('should return 404 when new topic not found in update', async () => {
      mockRequest.params = { id: 'resource-id' };
      mockRequest.body = { topicId: 'non-existent-topic' };
      mockResourceService.updateResource.mockRejectedValue(new NotFoundError('Topic'));

      await resourceController.updateResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topic not found'
      });
    });
  });

  describe('deleteResource - Error Cases', () => {
    it('should return 404 when resource to delete not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockResourceService.deleteResource.mockRejectedValue(new NotFoundError('Resource'));

      await resourceController.deleteResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found'
      });
    });
  });

  describe('getResourcesByTopic - Error Cases', () => {
    it('should return 404 when topic not found', async () => {
      mockRequest.params = { topicId: 'non-existent-topic' };
      mockResourceService.getResourcesByTopicId.mockRejectedValue(new NotFoundError('Topic'));

      await resourceController.getResourcesByTopic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topic not found'
      });
    });
  });

  describe('getResourcesByType - Error Cases', () => {
    it('should return 400 for invalid resource type', async () => {
      mockRequest.params = { type: 'invalid-type' };
      mockResourceService.getResourcesByType.mockRejectedValue(
        new ValidationError('Invalid resource type. Valid types are: video, article, pdf, link')
      );

      await resourceController.getResourcesByType(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid resource type. Valid types are: video, article, pdf, link'
      });
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle unexpected errors in getAllResources', async () => {
      mockResourceService.getAllResources.mockRejectedValue(new Error('Unexpected database error'));

      await resourceController.getAllResources(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching resources',
        error: 'Unexpected database error'
      });
    });

    it('should handle unexpected errors in createResource', async () => {
      mockRequest.body = {
        topicId: 'topic-id',
        url: 'https://example.com',
        description: 'Test description',
        type: ResourceType.ARTICLE
      };
      mockResourceService.createResource.mockRejectedValue(new Error('Database write error'));

      await resourceController.createResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error creating resource',
        error: 'Database write error'
      });
    });

    it('should handle unexpected errors in updateResource', async () => {
      mockRequest.params = { id: 'resource-id' };
      mockRequest.body = { description: 'Updated description' };
      mockResourceService.updateResource.mockRejectedValue(new Error('Database update error'));

      await resourceController.updateResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error updating resource',
        error: 'Database update error'
      });
    });

    it('should handle unexpected errors in deleteResource', async () => {
      mockRequest.params = { id: 'resource-id' };
      mockResourceService.deleteResource.mockRejectedValue(new Error('Database delete error'));

      await resourceController.deleteResource(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error deleting resource',
        error: 'Database delete error'
      });
    });

    it('should handle unexpected errors in getResourcesByTopic', async () => {
      mockRequest.params = { topicId: 'topic-id' };
      mockResourceService.getResourcesByTopicId.mockRejectedValue(new Error('Database query error'));

      await resourceController.getResourcesByTopic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching resources by topic',
        error: 'Database query error'
      });
    });

    it('should handle unexpected errors in getResourcesByType', async () => {
      mockRequest.params = { type: 'article' };
      mockResourceService.getResourcesByType.mockRejectedValue(new Error('Database query error'));

      await resourceController.getResourcesByType(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching resources by type',
        error: 'Database query error'
      });
    });
  });
});
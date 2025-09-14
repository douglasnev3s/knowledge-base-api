import { Request, Response } from 'express';
import { TopicController } from '../../../controllers/TopicController';
import { TopicService } from '../../../services/TopicService';
import { NotFoundError, ValidationError } from '../../../utils/errors/CustomErrors';

// Mock the TopicService
jest.mock('../../../services/TopicService');

describe('TopicController - Error Paths', () => {
  let topicController: TopicController;
  let mockTopicService: jest.Mocked<TopicService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockTopicService = {
      getAllTopics: jest.fn(),
      getTopicById: jest.fn(),
      createTopic: jest.fn(),
      updateTopic: jest.fn(),
      deleteTopic: jest.fn(),
      getTopicVersions: jest.fn(),
      getTopicVersion: jest.fn(),
      getTopicTree: jest.fn(),
      getShortestPath: jest.fn(),
      calculateTreeDepth: jest.fn(),
      countTopicsInTree: jest.fn(),
      createTopicSnapshot: jest.fn()
    } as any;

    topicController = new TopicController(mockTopicService);

    mockRequest = {
      params: {},
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getTopicById - Error Cases', () => {
    it('should return 404 when topic is not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockTopicService.getTopicById.mockRejectedValue(new NotFoundError('Topic'));

      await topicController.getTopicById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topic not found'
      });
    });

    it('should return 500 on unexpected error', async () => {
      mockRequest.params = { id: 'some-id' };
      mockTopicService.getTopicById.mockRejectedValue(new Error('Database connection failed'));

      await topicController.getTopicById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching topic',
        error: 'Database connection failed'
      });
    });
  });

  describe('createTopic - Error Cases', () => {
    it('should return 400 when required fields are missing', async () => {
      mockRequest.body = { name: 'Test Topic' }; // Missing content
      mockTopicService.createTopic.mockRejectedValue(new ValidationError('Name and content are required'));

      await topicController.createTopic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Name and content are required'
      });
    });

    it('should return 404 when parent topic not found', async () => {
      mockRequest.body = {
        name: 'Test Topic',
        content: 'Test content',
        parentTopicId: 'non-existent-parent'
      };
      mockTopicService.createTopic.mockRejectedValue(new NotFoundError('Parent topic'));

      await topicController.createTopic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Parent topic not found'
      });
    });

    it('should return 400 for invalid data', async () => {
      mockRequest.body = {
        name: '', // Invalid: empty name
        content: 'Test content'
      };
      mockTopicService.createTopic.mockRejectedValue(new ValidationError('Invalid name length'));

      await topicController.createTopic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid name length'
      });
    });
  });

  describe('updateTopic - Error Cases', () => {
    it('should return 400 for circular reference', async () => {
      mockRequest.params = { id: 'topic-id' };
      mockRequest.body = { parentTopicId: 'child-topic-id' };
      mockTopicService.updateTopic.mockRejectedValue(
        new ValidationError('Circular reference detected - cannot set parent topic')
      );

      await topicController.updateTopic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Circular reference detected - cannot set parent topic'
      });
    });

    it('should return 404 when topic to update not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { name: 'Updated Name' };
      mockTopicService.updateTopic.mockRejectedValue(new NotFoundError('Topic'));

      await topicController.updateTopic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topic not found'
      });
    });

    it('should return 400 for invalid update data', async () => {
      mockRequest.params = { id: 'topic-id' };
      mockRequest.body = {}; // No fields to update
      mockTopicService.updateTopic.mockRejectedValue(
        new ValidationError('At least one field (name, content, parentTopicId) must be provided')
      );

      await topicController.updateTopic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'At least one field (name, content, parentTopicId) must be provided'
      });
    });
  });

  describe('deleteTopic - Error Cases', () => {
    it('should return 404 when topic to delete not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockTopicService.deleteTopic.mockRejectedValue(new NotFoundError('Topic'));

      await topicController.deleteTopic(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topic not found'
      });
    });
  });

  describe('getTopicVersions - Error Cases', () => {
    it('should return 404 when topic not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockTopicService.getTopicVersions.mockRejectedValue(new NotFoundError('Topic'));

      await topicController.getTopicVersions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topic not found'
      });
    });
  });

  describe('getTopicVersion - Error Cases', () => {
    it('should return 400 for invalid version number', async () => {
      mockRequest.params = { id: 'topic-id', version: '0' };
      mockTopicService.getTopicVersion.mockRejectedValue(new ValidationError('Invalid version number'));

      await topicController.getTopicVersion(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid version number'
      });
    });

    it('should return 404 when topic version not found', async () => {
      mockRequest.params = { id: 'topic-id', version: '99' };
      mockTopicService.getTopicVersion.mockRejectedValue(new NotFoundError('Topic version'));

      await topicController.getTopicVersion(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topic version not found'
      });
    });
  });

  describe('getTopicTree - Error Cases', () => {
    it('should return 404 when root topic not found', async () => {
      mockRequest.params = { id: 'non-existent-root' };
      mockTopicService.getTopicTree.mockRejectedValue(new NotFoundError('Topic'));

      await topicController.getTopicTree(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topic not found'
      });
    });
  });

  describe('getShortestPath - Error Cases', () => {
    it('should return 400 when IDs are missing', async () => {
      mockRequest.params = { startId: '', endId: 'end-id' };
      mockTopicService.getShortestPath.mockRejectedValue(
        new ValidationError('Start ID and End ID are required')
      );

      await topicController.getShortestPath(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Start ID and End ID are required'
      });
    });

    it('should return 404 when no path exists', async () => {
      mockRequest.params = { startId: 'start-id', endId: 'end-id' };
      mockTopicService.getShortestPath.mockResolvedValue({
        found: false,
        path: [],
        pathNames: [],
        distance: -1,
        startTopicId: 'start-id',
        endTopicId: 'end-id'
      });

      await topicController.getShortestPath(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'No path found between the specified topics',
        data: {
          startTopicId: 'start-id',
          endTopicId: 'end-id',
          searched: true
        }
      });
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle unexpected errors in getAllTopics', async () => {
      mockTopicService.getAllTopics.mockRejectedValue(new Error('Unexpected database error'));

      await topicController.getAllTopics(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching topics',
        error: 'Unexpected database error'
      });
    });
  });
});
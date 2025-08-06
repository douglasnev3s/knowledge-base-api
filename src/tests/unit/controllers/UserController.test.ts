import { Request, Response } from 'express';
import { UserController } from '../../../controllers/UserController';
import { UserRepository } from '../../../repositories/UserRepository';
import { UserRole } from '../../../models/interfaces';

// Mock do UserRepository
jest.mock('../../../repositories/UserRepository');

describe('UserController', () => {
  let userController: UserController;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Criar mocks
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userController = new UserController();
    
    // Substituir repository real pelo mock
    (userController as any).userRepository = mockUserRepository;

    // Mock do Request
    mockRequest = {
      params: {},
      body: {},
      query: {}
    };

    // Mock do Response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'Test User 1',
          email: 'test1@example.com',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Test User 2',
          email: 'test2@example.com',
          role: UserRole.EDITOR,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        count: 2
      });
    });

    it('should handle repository errors', async () => {
      const errorMessage = 'Database connection failed';
      mockUserRepository.findAll.mockRejectedValue(new Error(errorMessage));

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching users',
        error: errorMessage
      });
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const userId = 'test-user-id';
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.VIEWER,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: userId };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should return 404 when user not found', async () => {
      const userId = 'non-existent-id';
      mockRequest.params = { id: userId };
      mockUserRepository.findById.mockResolvedValue(null);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        role: UserRole.EDITOR
      };

      const createdUser = {
        id: 'new-user-id',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.body = userData;
      mockUserRepository.create.mockResolvedValue(createdUser);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdUser,
        message: 'User created successfully'
      });
    });

    it('should return 400 for missing required fields', async () => {
      mockRequest.body = { name: 'Incomplete User' }; // Missing email and role

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Name, email and role are required'
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid role', async () => {
      mockRequest.body = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'InvalidRole'
      };

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid role. Must be Admin, Editor or Viewer'
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        role: UserRole.VIEWER
      };

      mockRequest.body = userData;
      mockUserRepository.create.mockRejectedValue(new Error('Email already exists'));

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email already exists'
      });
    });
  });
});
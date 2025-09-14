import { Request, Response, NextFunction } from 'express';
import { UserController } from '../../../controllers/UserController';
import { UserService } from '../../../services/UserService';
import { UserRole } from '../../../models/interfaces';

// Mock the UserService
jest.mock('../../../services/UserService');

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockUserService = new UserService() as jest.Mocked<UserService>;
    userController = new UserController(mockUserService);

    mockRequest = {
      params: {},
      body: {},
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
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

      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        count: 2
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
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
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
      mockUserService.createUser.mockResolvedValue(createdUser);

      await userController.createUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdUser,
        message: 'User created successfully'
      });
    });
  });
});
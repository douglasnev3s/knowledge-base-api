import { UserRepository } from '../../../repositories/UserRepository';
import { UserRole } from '../../../models/interfaces';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  describe('create', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.EDITOR
      };

      const user = await userRepository.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when email already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        role: UserRole.EDITOR
      };

      await userRepository.create(userData);

      await expect(userRepository.create(userData))
        .rejects
        .toThrow('Email already exists');
    });
  });

  describe('findAll', () => {
    it('should return empty array when no users exist', async () => {
      const users = await userRepository.findAll();
      expect(users).toEqual([]);
    });

    it('should return all users', async () => {
      const userData1 = {
        name: 'User 1',
        email: 'user1@example.com',
        role: UserRole.ADMIN
      };
      
      const userData2 = {
        name: 'User 2', 
        email: 'user2@example.com',
        role: UserRole.VIEWER
      };

      await userRepository.create(userData1);
      await userRepository.create(userData2);

      const users = await userRepository.findAll();
      expect(users).toHaveLength(2);
    });
  });
});
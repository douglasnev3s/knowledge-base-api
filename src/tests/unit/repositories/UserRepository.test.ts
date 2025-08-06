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

    it('should create users with different roles', async () => {
      const adminData = {
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN
      };

      const viewerData = {
        name: 'Viewer User',
        email: 'viewer@example.com',
        role: UserRole.VIEWER
      };

      const admin = await userRepository.create(adminData);
      const viewer = await userRepository.create(viewerData);

      expect(admin.role).toBe(UserRole.ADMIN);
      expect(viewer.role).toBe(UserRole.VIEWER);
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
      expect(users[0].email).toBe(userData1.email);
      expect(users[1].email).toBe(userData2.email);
    });
  });

  describe('findById', () => {
    it('should return user when ID exists', async () => {
      const userData = {
        name: 'Find Test',
        email: 'find@example.com',
        role: UserRole.EDITOR
      };

      const createdUser = await userRepository.create(userData);
      const foundUser = await userRepository.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should return null when ID does not exist', async () => {
      const foundUser = await userRepository.findById('non-existent-id');
      expect(foundUser).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userData = {
        name: 'Original Name',
        email: 'original@example.com',
        role: UserRole.VIEWER
      };

      const createdUser = await userRepository.create(userData);
      
      const updateData = {
        name: 'Updated Name',
        role: UserRole.EDITOR
      };

      const updatedUser = await userRepository.update(createdUser.id, updateData);

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.role).toBe(updateData.role);
      expect(updatedUser?.email).toBe(userData.email); // Email não mudou
      expect(updatedUser?.updatedAt).not.toEqual(createdUser.updatedAt);
    });

    it('should return null when updating non-existent user', async () => {
      const updateData = { name: 'New Name' };
      const result = await userRepository.update('non-existent-id', updateData);
      expect(result).toBeNull();
    });

    it('should throw error when updating to existing email', async () => {
      const user1Data = {
        name: 'User 1',
        email: 'user1@example.com',
        role: UserRole.EDITOR
      };

      const user2Data = {
        name: 'User 2',
        email: 'user2@example.com',
        role: UserRole.EDITOR
      };

      const user1 = await userRepository.create(user1Data);
      await userRepository.create(user2Data);

      await expect(userRepository.update(user1.id, { email: 'user2@example.com' }))
        .rejects
        .toThrow('Email already exists');
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const userData = {
        name: 'Delete Test',
        email: 'delete@example.com',
        role: UserRole.VIEWER
      };

      const createdUser = await userRepository.create(userData);
      const deleteResult = await userRepository.delete(createdUser.id);

      expect(deleteResult).toBe(true);

      const foundUser = await userRepository.findById(createdUser.id);
      expect(foundUser).toBeNull();
    });

    it('should return false when deleting non-existent user', async () => {
      const deleteResult = await userRepository.delete('non-existent-id');
      expect(deleteResult).toBe(false);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        name: 'Email Test',
        email: 'email@example.com',
        role: UserRole.ADMIN
      };

      await userRepository.create(userData);
      const foundUser = await userRepository.findByEmail(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should return null when email not found', async () => {
      const foundUser = await userRepository.findByEmail('notfound@example.com');
      expect(foundUser).toBeNull();
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      await userRepository.create({
        name: 'Admin 1',
        email: 'admin1@example.com',
        role: UserRole.ADMIN
      });

      await userRepository.create({
        name: 'Admin 2',
        email: 'admin2@example.com',
        role: UserRole.ADMIN
      });

      await userRepository.create({
        name: 'Editor 1',
        email: 'editor1@example.com',
        role: UserRole.EDITOR
      });

      const admins = await userRepository.findByRole(UserRole.ADMIN);
      const editors = await userRepository.findByRole(UserRole.EDITOR);

      expect(admins).toHaveLength(2);
      expect(editors).toHaveLength(1);
      expect(admins.every(user => user.role === UserRole.ADMIN)).toBe(true);
    });

    it('should return empty array when no users with role exist', async () => {
      const viewers = await userRepository.findByRole(UserRole.VIEWER);
      expect(viewers).toEqual([]);
    });
  });
});
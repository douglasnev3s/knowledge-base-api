import request from 'supertest';
import { Application } from 'express';
import { createTestApp, cleanTestData, testUsers } from './setup';

describe('User Routes Integration', () => {
  let app: Application;
  let adminUserId: string;
  let editorUserId: string;
  let viewerUserId: string;

  beforeAll(async () => {
    app = createTestApp();
  });

  beforeEach(async () => {
    await cleanTestData();
    
    const adminResponse = await request(app)
      .post('/api/users/setup')
      .send(testUsers.admin);
    adminUserId = adminResponse.body.data.id;

    const editorResponse = await request(app)
      .post('/api/users/setup')
      .send(testUsers.editor);
    editorUserId = editorResponse.body.data.id;

    const viewerResponse = await request(app)
      .post('/api/users/setup')
      .send(testUsers.viewer);
    viewerUserId = viewerResponse.body.data.id;
  });

  describe('Authentication & Authorization', () => {
    it('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Authentication required');
    });

    it('should reject invalid user ID', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('x-user-id', 'invalid-user-id');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid user credentials');
    });
  });

  describe('Admin permissions', () => {
    it('should allow admin to view all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('x-user-id', adminUserId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });

    it('should allow admin to create new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@test.com',
        role: 'Viewer'
      };

      const response = await request(app)
        .post('/api/users')
        .set('x-user-id', adminUserId)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newUser.name);
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data.id).toBeDefined();
    });

    it('should allow admin to update user', async () => {
      const updateData = {
        name: 'Updated Name',
        role: 'Admin'
      };

      const response = await request(app)
        .put(`/api/users/${editorUserId}`)
        .set('x-user-id', adminUserId)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.role).toBe(updateData.role);
    });

    it('should allow admin to delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${viewerUserId}`)
        .set('x-user-id', adminUserId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      const checkResponse = await request(app)
        .get(`/api/users/${viewerUserId}`)
        .set('x-user-id', adminUserId);

      expect(checkResponse.status).toBe(404);
    });
  });

  describe('Editor permissions', () => {
    it('should deny editor access to view users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('x-user-id', editorUserId);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should deny editor access to create users', async () => {
      const newUser = {
        name: 'Forbidden User',
        email: 'forbidden@test.com',
        role: 'Viewer'
      };

      const response = await request(app)
        .post('/api/users')
        .set('x-user-id', editorUserId)
        .send(newUser);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Viewer permissions', () => {
    it('should deny viewer access to user operations', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('x-user-id', viewerUserId);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Input validation', () => {
    it('should validate required fields when creating user', async () => {
      const incompleteUser = {
        name: 'Incomplete User'
        // Missing email and role
      };

      const response = await request(app)
        .post('/api/users')
        .set('x-user-id', adminUserId)
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should validate email uniqueness', async () => {
      const duplicateUser = {
        name: 'Duplicate User',
        email: testUsers.admin.email, // Email já existe
        role: 'Viewer'
      };

      const response = await request(app)
        .post('/api/users')
        .set('x-user-id', adminUserId)
        .send(duplicateUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already exists');
    });

    it('should validate role values', async () => {
      const invalidRoleUser = {
        name: 'Invalid Role User',
        email: 'invalid@test.com',
        role: 'InvalidRole'
      };

      const response = await request(app)
        .post('/api/users')
        .set('x-user-id', adminUserId)
        .send(invalidRoleUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Role must be one of');
    });
  });
});
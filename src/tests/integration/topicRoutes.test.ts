import request from 'supertest';
import { Application } from 'express';
import { createTestApp, cleanTestData, testUsers } from './setup';

describe('Topic Routes Integration', () => {
  let app: Application;
  let adminUserId: string;
  let editorUserId: string;
  let viewerUserId: string;
  let rootTopicId: string;

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

    const rootTopicResponse = await request(app)
      .post('/api/topics')
      .set('x-user-id', adminUserId)
      .send({
        name: 'Root Topic',
        content: 'Root content for testing'
      });
    rootTopicId = rootTopicResponse.body.data.id;
  });

  describe('Topic CRUD with permissions', () => {
    it('should allow editor to create topics', async () => {
      const topicData = {
        name: 'Editor Topic',
        content: 'Topic created by editor',
        parentTopicId: rootTopicId
      };

      const response = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send(topicData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(topicData.name);
      expect(response.body.data.version).toBe(1);
      expect(response.body.data.parentTopicId).toBe(rootTopicId);
    });

    it('should deny viewer from creating topics', async () => {
      const topicData = {
        name: 'Forbidden Topic',
        content: 'This should fail'
      };

      const response = await request(app)
        .post('/api/topics')
        .set('x-user-id', viewerUserId)
        .send(topicData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should allow all roles to view topics', async () => {
      // Admin
      const adminResponse = await request(app)
        .get('/api/topics')
        .set('x-user-id', adminUserId);
      expect(adminResponse.status).toBe(200);

      // Editor
      const editorResponse = await request(app)
        .get('/api/topics')
        .set('x-user-id', editorUserId);
      expect(editorResponse.status).toBe(200);

      // Viewer
      const viewerResponse = await request(app)
        .get('/api/topics')
        .set('x-user-id', viewerUserId);
      expect(viewerResponse.status).toBe(200);
    });
  });

  describe('Topic versioning system', () => {
    it('should create new version on update', async () => {
      const updateData = {
        name: 'Updated Root Topic',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/topics/${rootTopicId}`)
        .set('x-user-id', editorUserId)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.version).toBe(2); // Version incremented
      expect(response.body.data.name).toBe(updateData.name);

      // Check versions endpoint
      const versionsResponse = await request(app)
        .get(`/api/topics/${rootTopicId}/versions`)
        .set('x-user-id', viewerUserId);

      expect(versionsResponse.status).toBe(200);
      expect(versionsResponse.body.data).toHaveLength(2); // Original + updated
      expect(versionsResponse.body.currentVersion).toBe(2);
    });

    it('should retrieve specific topic version', async () => {
      // Update topic to create version 2
      await request(app)
        .put(`/api/topics/${rootTopicId}`)
        .set('x-user-id', editorUserId)
        .send({ name: 'Version 2' });

      // Get version 1
      const version1Response = await request(app)
        .get(`/api/topics/${rootTopicId}/versions/1`)
        .set('x-user-id', viewerUserId);

      expect(version1Response.status).toBe(200);
      expect(version1Response.body.data.version).toBe(1);
      expect(version1Response.body.data.name).toBe('Root Topic'); // Original name

      // Get version 2
      const version2Response = await request(app)
        .get(`/api/topics/${rootTopicId}/versions/2`)
        .set('x-user-id', viewerUserId);

      expect(version2Response.status).toBe(200);
      expect(version2Response.body.data.version).toBe(2);
      expect(version2Response.body.data.name).toBe('Version 2');
    });
  });

  describe('Topic hierarchy and tree structure', () => {
    it('should build topic tree recursively', async () => {
      // Create child topic
      const childResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'Child Topic',
          content: 'Child content',
          parentTopicId: rootTopicId
        });
      const childTopicId = childResponse.body.data.id;

      // Create grandchild topic
      await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'Grandchild Topic',
          content: 'Grandchild content',
          parentTopicId: childTopicId
        });

      // Get tree structure
      const treeResponse = await request(app)
        .get(`/api/topics/${rootTopicId}/tree`)
        .set('x-user-id', viewerUserId);

      expect(treeResponse.status).toBe(200);
      expect(treeResponse.body.success).toBe(true);
      expect(treeResponse.body.data.name).toBe('Root Topic');
      expect(treeResponse.body.data.children).toHaveLength(1);
      expect(treeResponse.body.data.children[0].name).toBe('Child Topic');
      expect(treeResponse.body.data.children[0].children).toHaveLength(1);
      expect(treeResponse.body.data.children[0].children[0].name).toBe('Grandchild Topic');
      expect(treeResponse.body.metadata.totalTopics).toBe(3);
      expect(treeResponse.body.metadata.depth).toBe(3);
    });
  });

  describe('Shortest path algorithm', () => {
    it('should find shortest path between topics', async () => {
      // Create topic hierarchy for path testing
      const jsResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'JavaScript',
          content: 'JS content',
          parentTopicId: rootTopicId
        });
      const jsTopicId = jsResponse.body.data.id;

      const varsResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'Variables',
          content: 'Variables content',
          parentTopicId: jsTopicId
        });
      const varsTopicId = varsResponse.body.data.id;

      const funcsResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'Functions',
          content: 'Functions content',
          parentTopicId: jsTopicId
        });
      const funcsTopicId = funcsResponse.body.data.id;

      // Find path between Variables and Functions (siblings)
      const pathResponse = await request(app)
        .get(`/api/topics/path/${varsTopicId}/${funcsTopicId}`)
        .set('x-user-id', viewerUserId);

      expect(pathResponse.status).toBe(200);
      expect(pathResponse.body.success).toBe(true);
      expect(pathResponse.body.data.found).toBe(true);
      expect(pathResponse.body.data.distance).toBe(2); // Variables → JS → Functions
      expect(pathResponse.body.data.pathNames).toEqual(['Variables', 'JavaScript', 'Functions']);
    });

    it('should return not found for disconnected topics', async () => {
      // Create isolated topic
      const isolatedResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'Isolated Topic',
          content: 'Isolated content'
        });
      const isolatedTopicId = isolatedResponse.body.data.id;

      const pathResponse = await request(app)
        .get(`/api/topics/path/${rootTopicId}/${isolatedTopicId}`)
        .set('x-user-id', viewerUserId);

      expect(pathResponse.status).toBe(404);
      expect(pathResponse.body.success).toBe(false);
      expect(pathResponse.body.message).toContain('No path found');
    });
  });

  describe('Input validation', () => {
    it('should validate required fields', async () => {
      const invalidTopic = {
        name: '', // Empty name
        content: 'Valid content'
      };

      const response = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send(invalidTopic);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should validate parent topic existence', async () => {
      const invalidTopic = {
        name: 'Valid Topic',
        content: 'Valid content',
        parentTopicId: 'non-existent-parent'
      };

      const response = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send(invalidTopic);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Parent topic not found');
    });

    it('should prevent circular references', async () => {
      // Create child topic
      const childResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'Child Topic',
          content: 'Child content',
          parentTopicId: rootTopicId
        });
      const childTopicId = childResponse.body.data.id;

      // Try to make root a child of its own child (circular)
      const response = await request(app)
        .put(`/api/topics/${rootTopicId}`)
        .set('x-user-id', editorUserId)
        .send({
          parentTopicId: childTopicId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Circular reference detected');
    });
  });
});
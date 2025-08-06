import request from 'supertest';
import { Application } from 'express';
import { createTestApp, cleanTestData, testUsers } from './setup';

describe('End-to-End Integration Tests', () => {
  let app: Application;
  let adminUserId: string;
  let editorUserId: string;
  let viewerUserId: string;

  beforeAll(async () => {
    app = createTestApp();
  });

  beforeEach(async () => {
    await cleanTestData();
    
    // Setup users
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

  describe('Complete Knowledge Base Workflow', () => {
    it('should complete full workflow: create topics → add resources → version management → permissions', async () => {
      // 1. Admin creates programming curriculum structure
      const programmingResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', adminUserId)
        .send({
          name: 'Programming Fundamentals',
          content: 'Complete programming curriculum'
        });
      const programmingId = programmingResponse.body.data.id;
      expect(programmingResponse.status).toBe(201);

      // 2. Editor adds JavaScript subtopic
      const jsResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'JavaScript Basics',
          content: 'Introduction to JavaScript programming',
          parentTopicId: programmingId
        });
      const jsId = jsResponse.body.data.id;
      expect(jsResponse.status).toBe(201);

      // 3. Editor adds detailed subtopics
      const variablesResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'Variables & Data Types',
          content: 'Understanding JavaScript variables',
          parentTopicId: jsId
        });
      const variablesId = variablesResponse.body.data.id;

      const functionsResponse = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .send({
          name: 'Functions',
          content: 'JavaScript functions and scope',
          parentTopicId: jsId
        });
      const functionsId = functionsResponse.body.data.id;

      // 4. Editor adds learning resources
      const videoResource = await request(app)
        .post('/api/resources')
        .set('x-user-id', editorUserId)
        .send({
          topicId: variablesId,
          url: 'https://www.youtube.com/watch?v=example',
          description: 'JavaScript Variables Tutorial',
          type: 'video'
        });
      expect(videoResource.status).toBe(201);

      const articleResource = await request(app)
        .post('/api/resources')
        .set('x-user-id', editorUserId)
        .send({
          topicId: functionsId,
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Functions',
          description: 'MDN Functions Documentation',
          type: 'article'
        });
      expect(articleResource.status).toBe(201);

      // 5. Editor updates topic content (creates version 2)
      const updatedJS = await request(app)
        .put(`/api/topics/${jsId}`)
        .set('x-user-id', editorUserId)
        .send({
          name: 'JavaScript Fundamentals',
          content: 'Comprehensive JavaScript programming guide with examples'
        });
      expect(updatedJS.status).toBe(200);
      expect(updatedJS.body.data.version).toBe(2);

      // 6. Viewer can access content but not modify
      const viewTopics = await request(app)
        .get('/api/topics')
        .set('x-user-id', viewerUserId);
      expect(viewTopics.status).toBe(200);
      expect(viewTopics.body.data).toHaveLength(4);

      const viewResources = await request(app)
        .get('/api/resources')
        .set('x-user-id', viewerUserId);
      expect(viewResources.status).toBe(200);
      expect(viewResources.body.data).toHaveLength(2);

      // 7. Viewer cannot create content
      const forbiddenTopic = await request(app)
        .post('/api/topics')
        .set('x-user-id', viewerUserId)
        .send({
          name: 'Forbidden Topic',
          content: 'This should fail'
        });
      expect(forbiddenTopic.status).toBe(403);

      // 8. Check topic hierarchy tree
      const topicTree = await request(app)
        .get(`/api/topics/${programmingId}/tree`)
        .set('x-user-id', viewerUserId);
      expect(topicTree.status).toBe(200);
      expect(topicTree.body.data.children).toHaveLength(1);
      expect(topicTree.body.data.children[0].children).toHaveLength(2);
      expect(topicTree.body.metadata.totalTopics).toBe(4);

      // 9. Test shortest path algorithm
      const shortestPath = await request(app)
        .get(`/api/topics/path/${variablesId}/${functionsId}`)
        .set('x-user-id', viewerUserId);
      expect(shortestPath.status).toBe(200);
      expect(shortestPath.body.data.distance).toBe(2);
      expect(shortestPath.body.data.pathNames).toEqual([
        'Variables & Data Types',
        'JavaScript Fundamentals', 
        'Functions'
      ]);

      // 10. Check version history
      const versions = await request(app)
        .get(`/api/topics/${jsId}/versions`)
        .set('x-user-id', viewerUserId);
      expect(versions.status).toBe(200);
      expect(versions.body.data).toHaveLength(2);
      expect(versions.body.currentVersion).toBe(2);

      // 11. Retrieve specific version
      const version1 = await request(app)
        .get(`/api/topics/${jsId}/versions/1`)
        .set('x-user-id', viewerUserId);
      expect(version1.status).toBe(200);
      expect(version1.body.data.name).toBe('JavaScript Basics');

      // 12. Get resources by topic
      const topicResources = await request(app)
        .get(`/api/resources/topic/${variablesId}`)
        .set('x-user-id', viewerUserId);
      expect(topicResources.status).toBe(200);
      expect(topicResources.body.data).toHaveLength(1);
      expect(topicResources.body.data[0].type).toBe('video');

      // 13. Admin can manage users
      const newEditor = await request(app)
        .post('/api/users')
        .set('x-user-id', adminUserId)
        .send({
          name: 'New Editor',
          email: 'neweditor@test.com',
          role: 'Editor'
        });
      expect(newEditor.status).toBe(201);

      // 14. Check permissions endpoint
      const adminPermissions = await request(app)
        .get('/api/permissions/check')
        .set('x-user-id', adminUserId);
      expect(adminPermissions.status).toBe(200);
      expect(adminPermissions.body.data.permissions.users.create).toBe(true);

      const viewerPermissions = await request(app)
        .get('/api/permissions/check')
        .set('x-user-id', viewerUserId);
      expect(viewerPermissions.status).toBe(200);
      expect(viewerPermissions.body.data.permissions.users.create).toBe(false);
      expect(viewerPermissions.body.data.permissions.topics.view).toBe(true);
    });
  });

  describe('Health Check and API Status', () => {
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('Knowledge Base API is running');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('x-user-id', adminUserId);

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/topics')
        .set('x-user-id', editorUserId)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });
});
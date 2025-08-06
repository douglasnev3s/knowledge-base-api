import { TopicRepository } from '../../../repositories/TopicRepository';

describe('TopicRepository', () => {
  let topicRepository: TopicRepository;

  beforeEach(() => {
    topicRepository = new TopicRepository();
  });

  describe('create', () => {
    it('should create a new topic with valid data', async () => {
      const topicData = {
        name: 'Test Topic',
        content: 'Test content for topic'
      };

      const topic = await topicRepository.create(topicData);

      expect(topic).toBeDefined();
      expect(topic.id).toBeDefined();
      expect(topic.name).toBe(topicData.name);
      expect(topic.content).toBe(topicData.content);
      expect(topic.version).toBe(1);
      expect(topic.parentTopicId).toBeUndefined();
      expect(topic.createdAt).toBeInstanceOf(Date);
      expect(topic.updatedAt).toBeInstanceOf(Date);
    });

    it('should create topic with parent', async () => {
      const parentTopic = await topicRepository.create({
        name: 'Parent Topic',
        content: 'Parent content'
      });

      const childTopic = await topicRepository.create({
        name: 'Child Topic',
        content: 'Child content',
        parentTopicId: parentTopic.id
      });

      expect(childTopic.parentTopicId).toBe(parentTopic.id);
    });

    it('should throw error when parent topic does not exist', async () => {
      const topicData = {
        name: 'Orphan Topic',
        content: 'Orphan content',
        parentTopicId: 'non-existent-parent'
      };

      await expect(topicRepository.create(topicData))
        .rejects
        .toThrow('Parent topic not found');
    });
  });

  describe('update (with versioning)', () => {
    it('should create new version when updating', async () => {
      const originalTopic = await topicRepository.create({
        name: 'Original Topic',
        content: 'Original content'
      });

      const updatedTopic = await topicRepository.update(originalTopic.id, {
        name: 'Updated Topic',
        content: 'Updated content'
      });

      expect(updatedTopic).toBeDefined();
      expect(updatedTopic?.name).toBe('Updated Topic');
      expect(updatedTopic?.content).toBe('Updated content');
      expect(updatedTopic?.version).toBe(2); // Versão incrementada
      expect(updatedTopic?.id).toBe(originalTopic.id); // Mesmo ID
    });

    it('should prevent circular reference', async () => {
      const topicA = await topicRepository.create({
        name: 'Topic A',
        content: 'Content A'
      });

      const topicB = await topicRepository.create({
        name: 'Topic B',
        content: 'Content B',
        parentTopicId: topicA.id
      });

      // Tentar fazer A ser filho de B (circular)
      await expect(topicRepository.update(topicA.id, {
        parentTopicId: topicB.id
      })).rejects.toThrow('Circular reference detected');
    });
  });

  describe('findByParentId', () => {
    it('should find children of a topic', async () => {
      const parent = await topicRepository.create({
        name: 'Parent',
        content: 'Parent content'
      });

      await topicRepository.create({
        name: 'Child 1',
        content: 'Child 1 content',
        parentTopicId: parent.id
      });

      await topicRepository.create({
        name: 'Child 2',
        content: 'Child 2 content',
        parentTopicId: parent.id
      });

      const children = await topicRepository.findByParentId(parent.id);
      expect(children).toHaveLength(2);
      expect(children.every(child => child.parentTopicId === parent.id)).toBe(true);
    });

    it('should find root topics (no parent)', async () => {
      await topicRepository.create({
        name: 'Root 1',
        content: 'Root content 1'
      });

      await topicRepository.create({
        name: 'Root 2',
        content: 'Root content 2'
      });

      await topicRepository.findAll();

      const rootTopics = await topicRepository.findByParentId(null);

      expect(rootTopics).toHaveLength(2);
      expect(rootTopics.every(topic => !topic.parentTopicId)).toBe(true);
    });
  });

  describe('buildTopicTree', () => {
    it('should build complete topic tree', async () => {
      const root = await topicRepository.create({
        name: 'Root',
        content: 'Root content'
      });

      const child1 = await topicRepository.create({
        name: 'Child 1',
        content: 'Child 1 content',
        parentTopicId: root.id
      });

      await topicRepository.create({
        name: 'Grandchild',
        content: 'Grandchild content',
        parentTopicId: child1.id
      });

      const tree = await topicRepository.buildTopicTree(root.id);

      expect(tree).toBeDefined();
      expect(tree?.name).toBe('Root');
      expect(tree?.children).toHaveLength(1);
      expect(tree?.children[0].name).toBe('Child 1');
      expect(tree?.children[0].children).toHaveLength(1);
      expect(tree?.children[0].children[0].name).toBe('Grandchild');
    });

    it('should return null for non-existent topic', async () => {
      const tree = await topicRepository.buildTopicTree('non-existent');
      expect(tree).toBeNull();
    });
  });

  describe('findShortestPath', () => {
    it('should find shortest path between connected topics', async () => {
      const root = await topicRepository.create({
        name: 'Root',
        content: 'Root content'
      });

      const child1 = await topicRepository.create({
        name: 'Child 1',
        content: 'Child 1 content',
        parentTopicId: root.id
      });

      const child2 = await topicRepository.create({
        name: 'Child 2',
        content: 'Child 2 content',
        parentTopicId: root.id
      });

      const path = await topicRepository.findShortestPath(child1.id, child2.id);

      expect(path.found).toBe(true);
      expect(path.distance).toBe(2); // child1 → root → child2
      expect(path.path).toHaveLength(3);
      expect(path.pathNames).toEqual(['Child 1', 'Root', 'Child 2']);
    });

    it('should return same topic path', async () => {
      const topic = await topicRepository.create({
        name: 'Same Topic',
        content: 'Same content'
      });

      const path = await topicRepository.findShortestPath(topic.id, topic.id);

      expect(path.found).toBe(true);
      expect(path.distance).toBe(0);
      expect(path.path).toEqual([topic.id]);
    });

    it('should return not found for non-existent topics', async () => {
      const path = await topicRepository.findShortestPath('non-existent-1', 'non-existent-2');

      expect(path.found).toBe(false);
      expect(path.path).toEqual([]);
      expect(path.distance).toBe(0);
    });
  });
});
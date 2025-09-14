import { ITopic, ICreateTopicDto, IUpdateTopicDto, ITopicTree, ITopicPath } from '../models/interfaces';
import { TopicRepository } from '../repositories/TopicRepository';
import { TopicVersionRepository } from '../repositories/TopicVersionRepository';
import { ValidationError, NotFoundError } from '../utils/errors/CustomErrors';
import { InputValidator } from '../utils/validators/inputValidator';
import { TopicVersionFactory } from './factories/TopicVersionFactory';

export class TopicService {
  private topicRepository: TopicRepository;
  private topicVersionRepository: TopicVersionRepository;

  constructor(
    topicRepository?: TopicRepository,
    topicVersionRepository?: TopicVersionRepository
  ) {
    this.topicRepository = topicRepository || new TopicRepository();
    this.topicVersionRepository = topicVersionRepository || new TopicVersionRepository();
  }

  async getAllTopics(): Promise<ITopic[]> {
    return await this.topicRepository.findAll();
  }

  async getTopicById(id: string): Promise<ITopic> {
    InputValidator.validateObjectId(id, 'Topic ID');

    const topic = await this.topicRepository.findById(id);
    if (!topic) {
      throw new NotFoundError('Topic');
    }

    return topic;
  }

  async createTopic(topicData: ICreateTopicDto): Promise<ITopic> {
    this.validateCreateTopicData(topicData);

    if (topicData.parentTopicId) {
      await this.validateParentTopicExists(topicData.parentTopicId);
    }

    const newTopic = await this.topicRepository.create(topicData);

    // Create initial version using Factory
    const initialVersionData = TopicVersionFactory.createVersion('initial', newTopic);
    await this.topicVersionRepository.create(initialVersionData);

    return newTopic;
  }

  async updateTopic(id: string, updateData: IUpdateTopicDto): Promise<ITopic> {
    InputValidator.validateObjectId(id, 'Topic ID');
    this.validateUpdateTopicData(updateData);

    const existingTopic = await this.getTopicById(id);

    if (updateData.parentTopicId !== undefined && updateData.parentTopicId !== null) {
      await this.validateParentTopicExists(updateData.parentTopicId);
      await this.validateNoCircularReference(id, updateData.parentTopicId);
    }

    const newVersionNumber = existingTopic.version + 1;

    // Create new version using Factory before updating
    const newVersionData = TopicVersionFactory.createVersion(
      'update',
      existingTopic,
      updateData,
      newVersionNumber
    );
    await this.topicVersionRepository.create(newVersionData);

    const updatedTopic = await this.topicRepository.update(id, updateData);
    if (!updatedTopic) {
      throw new NotFoundError('Topic');
    }

    return updatedTopic;
  }

  async deleteTopic(id: string): Promise<void> {
    InputValidator.validateObjectId(id, 'Topic ID');

    const deleted = await this.topicRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Topic');
    }
  }

  async getTopicVersions(topicId: string): Promise<any[]> {
    InputValidator.validateObjectId(topicId, 'Topic ID');

    await this.getTopicById(topicId); // Validate topic exists

    return await this.topicVersionRepository.findByTopicId(topicId);
  }

  async getTopicVersion(topicId: string, version: number): Promise<any> {
    InputValidator.validateObjectId(topicId, 'Topic ID');

    if (isNaN(version) || version < 1) {
      throw new ValidationError('Invalid version number');
    }

    const topicVersion = await this.topicVersionRepository.findByTopicIdAndVersion(topicId, version);
    if (!topicVersion) {
      throw new NotFoundError('Topic version');
    }

    return topicVersion;
  }

  async getTopicTree(id: string): Promise<ITopicTree> {
    InputValidator.validateObjectId(id, 'Topic ID');

    const topicTree = await this.topicRepository.buildTopicTree(id);
    if (!topicTree) {
      throw new NotFoundError('Topic');
    }

    return topicTree;
  }

  async getShortestPath(startId: string, endId: string): Promise<ITopicPath> {
    InputValidator.validateObjectId(startId, 'Start Topic ID');
    InputValidator.validateObjectId(endId, 'End Topic ID');

    if (!startId || !endId) {
      throw new ValidationError('Start ID and End ID are required');
    }

    return await this.topicRepository.findShortestPath(startId, endId);
  }

  private validateCreateTopicData(data: ICreateTopicDto): void {
    if (!data.name || !data.content) {
      throw new ValidationError('Name and content are required');
    }

    InputValidator.validateStringLength(data.name, 'Name', 1, 200);
    InputValidator.validateStringLength(data.content, 'Content', 1, 10000);

    if (data.parentTopicId) {
      InputValidator.validateObjectId(data.parentTopicId, 'Parent Topic ID');
    }
  }

  private validateUpdateTopicData(data: IUpdateTopicDto): void {
    if (!data.name && !data.content && data.parentTopicId === undefined) {
      throw new ValidationError('At least one field (name, content, parentTopicId) must be provided');
    }

    if (data.name) {
      InputValidator.validateStringLength(data.name, 'Name', 1, 200);
    }

    if (data.content) {
      InputValidator.validateStringLength(data.content, 'Content', 1, 10000);
    }

    if (data.parentTopicId) {
      InputValidator.validateObjectId(data.parentTopicId, 'Parent Topic ID');
    }
  }

  private async validateParentTopicExists(parentTopicId: string): Promise<void> {
    const parentTopic = await this.topicRepository.findById(parentTopicId);
    if (!parentTopic) {
      throw new NotFoundError('Parent topic');
    }
  }

  private async validateNoCircularReference(topicId: string, parentTopicId: string): Promise<void> {
    const allTopics = await this.topicRepository.findAll();
    const wouldCreateCircular = await this.topicRepository.wouldCreateCircularReference(
      topicId,
      parentTopicId,
      allTopics
    );

    if (wouldCreateCircular) {
      throw new ValidationError('Circular reference detected - cannot set parent topic');
    }
  }

  calculateTreeDepth(tree: ITopicTree): number {
    if (tree.children.length === 0) {
      return 1;
    }

    const childDepths = tree.children.map(child => this.calculateTreeDepth(child));
    return 1 + Math.max(...childDepths);
  }

  countTopicsInTree(tree: ITopicTree): number {
    return 1 + tree.children.reduce((sum, child) => sum + this.countTopicsInTree(child), 0);
  }

  async createTopicSnapshot(topicId: string, versionNumber?: number): Promise<any> {
    const topic = await this.getTopicById(topicId);

    const snapshotVersionData = TopicVersionFactory.createVersion(
      'snapshot',
      topic,
      undefined,
      versionNumber
    );

    return await this.topicVersionRepository.create(snapshotVersionData);
  }
}
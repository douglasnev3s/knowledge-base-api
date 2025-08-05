import { BaseRepository } from './BaseRepository';
import { ITopic, ICreateTopicDto, IUpdateTopicDto, ITopicTree } from '../models/interfaces';
import { TopicVersionRepository } from './TopicVersionRepository';
import { v4 as uuidv4 } from 'uuid';

export class TopicRepository extends BaseRepository<ITopic, ICreateTopicDto, IUpdateTopicDto> {
  private topicVersionRepository: TopicVersionRepository;

  constructor() {
    super('topics.json');
    this.topicVersionRepository = new TopicVersionRepository();
  }

  async create(data: ICreateTopicDto): Promise<ITopic> {
    const topics = await this.readData();
    
    if (data.parentTopicId) {
      const parentExists = topics.find(topic => topic.id === data.parentTopicId);
      if (!parentExists) {
        throw new Error('Parent topic not found');
      }
    }

    const newTopic: ITopic = {
      id: uuidv4(),
      name: data.name,
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      parentTopicId: data.parentTopicId
    };

    topics.push(newTopic);
    await this.writeData(topics);
    
    await this.topicVersionRepository.create({
      topicId: newTopic.id,
      name: newTopic.name,
      content: newTopic.content,
      version: 1,
      parentTopicId: newTopic.parentTopicId
    });
    
    return newTopic;
  }

  async update(id: string, data: IUpdateTopicDto): Promise<ITopic | null> {
    const topics = await this.readData();
    const topicIndex = topics.findIndex(topic => topic.id === id);
    
    if (topicIndex === -1) return null;

    const currentTopic = topics[topicIndex];

    if (data.parentTopicId !== undefined) {
      if (data.parentTopicId && data.parentTopicId !== id) {
        const parentExists = topics.find(topic => topic.id === data.parentTopicId);
        if (!parentExists) {
          throw new Error('Parent topic not found');
        }
        
        if (await this.wouldCreateCircularReference(id, data.parentTopicId, topics)) {
          throw new Error('Circular reference detected');
        }
      }
    }

    const newVersion = currentTopic.version + 1;
    const updatedTopic: ITopic = {
      ...currentTopic,
      ...data,
      version: newVersion,
      updatedAt: new Date()
    };

    topics[topicIndex] = updatedTopic;
    await this.writeData(topics);
    
    await this.topicVersionRepository.create({
      topicId: updatedTopic.id,
      name: updatedTopic.name,
      content: updatedTopic.content,
      version: newVersion,
      parentTopicId: updatedTopic.parentTopicId
    });
    
    return updatedTopic;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await super.delete(id);
    
    if (deleted) {
      await this.topicVersionRepository.deleteByTopicId(id);
    }
    
    return deleted;
  }

  private async wouldCreateCircularReference(
    topicId: string, 
    newParentId: string, 
    topics: ITopic[]
  ): Promise<boolean> {
    let currentParentId: string | null = newParentId;
    
    while (currentParentId) {
      if (currentParentId === topicId) {
        return true;
      }
      
      const parent = topics.find(topic => topic.id === currentParentId);
      currentParentId = parent?.parentTopicId || null;
    }
    
    return false;
  }

  async findByParentId(parentId: string | null): Promise<ITopic[]> {
    const topics = await this.readData();
    return topics.filter(topic => topic.parentTopicId === parentId);
  }

  async findRootTopics(): Promise<ITopic[]> {
    return await this.findByParentId(null);
  }

  async findByName(name: string): Promise<ITopic[]> {
    const topics = await this.readData();
    return topics.filter(topic => 
      topic.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  async buildTopicTree(topicId: string): Promise<ITopicTree | null> {
    const topic = await this.findById(topicId);
    if (!topic) return null;

    const children = await this.findByParentId(topicId);
    
    const childTrees: ITopicTree[] = [];
    for (const child of children) {
      const childTree = await this.buildTopicTree(child.id);
      if (childTree) {
        childTrees.push(childTree);
      }
    }

    const topicTree: ITopicTree = {
      id: topic.id,
      name: topic.name,
      content: topic.content,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      version: topic.version,
      parentTopicId: topic.parentTopicId,
      children: childTrees
    };

    return topicTree;
  }
}
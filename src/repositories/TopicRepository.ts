import { BaseRepository } from './BaseRepository';
import { ITopic, ICreateTopicDto, IUpdateTopicDto } from '../models/interfaces';
import { v4 as uuidv4 } from 'uuid';

export class TopicRepository extends BaseRepository<ITopic, ICreateTopicDto, IUpdateTopicDto> {
  
  constructor() {
    super('topics.json');
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
    
    return newTopic;
  }

  async update(id: string, data: IUpdateTopicDto): Promise<ITopic | null> {
    const topics = await this.readData();
    const topicIndex = topics.findIndex(topic => topic.id === id);
    
    if (topicIndex === -1) return null;

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

    const updatedTopic: ITopic = {
      ...topics[topicIndex],
      ...data,
      version: topics[topicIndex].version + 1,
      updatedAt: new Date()
    };

    topics[topicIndex] = updatedTopic;
    await this.writeData(topics);
    
    return updatedTopic;
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
}
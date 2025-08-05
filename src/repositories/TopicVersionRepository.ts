import { BaseRepository } from './BaseRepository';
import { ICreateTopicVersionDto, ITopicVersion } from '../models/interfaces';
import { v4 as uuidv4 } from 'uuid';

export class TopicVersionRepository extends BaseRepository<ITopicVersion, ICreateTopicVersionDto, never> {
  
  constructor() {
    super('topic-versions.json');
  }

  async create(data: ICreateTopicVersionDto): Promise<ITopicVersion> {
    const versions = await this.readData();
    
    const newVersion: ITopicVersion = {
      id: uuidv4(),
      topicId: data.topicId,
      name: data.name,
      content: data.content,
      version: data.version,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentTopicId: data.parentTopicId
    };

    versions.push(newVersion);
    await this.writeData(versions);
    
    return newVersion;
  }

  async update(): Promise<never> {
    throw new Error('Topic versions are immutable and cannot be updated');
  }

  async findByTopicId(topicId: string): Promise<ITopicVersion[]> {
    const versions = await this.readData();
    return versions
      .filter(version => version.topicId === topicId)
      .sort((a, b) => b.version - a.version);
  }

  async findByTopicIdAndVersion(topicId: string, version: number): Promise<ITopicVersion | null> {
    const versions = await this.readData();
    return versions.find(v => v.topicId === topicId && v.version === version) || null;
  }

  async findLatestByTopicId(topicId: string): Promise<ITopicVersion | null> {
    const versions = await this.findByTopicId(topicId);
    return versions[0] || null;
  }

  async deleteByTopicId(topicId: string): Promise<number> {
    const versions = await this.readData();
    const filteredVersions = versions.filter(version => version.topicId !== topicId);
    const deletedCount = versions.length - filteredVersions.length;
    
    await this.writeData(filteredVersions);
    return deletedCount;
  }
}
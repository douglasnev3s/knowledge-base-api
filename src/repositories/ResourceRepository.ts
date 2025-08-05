import { BaseRepository } from './BaseRepository';
import { IResource, ICreateResourceDto, IUpdateResourceDto } from '../models/interfaces';
import { v4 as uuidv4 } from 'uuid';

export class ResourceRepository extends BaseRepository<IResource, ICreateResourceDto, IUpdateResourceDto> {
  
  constructor() {
    super('resources.json');
  }

  async create(data: ICreateResourceDto): Promise<IResource> {
    const resources = await this.readData();
    
    if (!data.topicId) {
      throw new Error('Topic ID is required');
    }

    const newResource: IResource = {
      id: uuidv4(),
      topicId: data.topicId,
      url: data.url,
      description: data.description,
      type: data.type,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    resources.push(newResource);
    await this.writeData(resources);
    
    return newResource;
  }

  async update(id: string, data: IUpdateResourceDto): Promise<IResource | null> {
    const resources = await this.readData();
    const resourceIndex = resources.findIndex(resource => resource.id === id);
    
    if (resourceIndex === -1) return null;

    const updatedResource: IResource = {
      ...resources[resourceIndex],
      ...data,
      updatedAt: new Date()
    };

    resources[resourceIndex] = updatedResource;
    await this.writeData(resources);
    
    return updatedResource;
  }

  async findByTopicId(topicId: string): Promise<IResource[]> {
    const resources = await this.readData();
    return resources.filter(resource => resource.topicId === topicId);
  }

  async findByType(type: string): Promise<IResource[]> {
    const resources = await this.readData();
    return resources.filter(resource => resource.type === type);
  }

  async findByUrl(url: string): Promise<IResource | null> {
    const resources = await this.readData();
    return resources.find(resource => resource.url === url) || null;
  }

  async deleteByTopicId(topicId: string): Promise<number> {
    const resources = await this.readData();
    const filteredResources = resources.filter(resource => resource.topicId !== topicId);
    const deletedCount = resources.length - filteredResources.length;
    
    await this.writeData(filteredResources);
    return deletedCount;
  }
}
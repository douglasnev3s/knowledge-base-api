import { IResource, ICreateResourceDto, IUpdateResourceDto, ResourceType } from '../models/interfaces';
import { ResourceRepository } from '../repositories/ResourceRepository';
import { TopicRepository } from '../repositories/TopicRepository';
import { ValidationError, NotFoundError } from '../utils/errors/CustomErrors';
import { InputValidator } from '../utils/validators/inputValidator';

export class ResourceService {
  private resourceRepository: ResourceRepository;
  private topicRepository: TopicRepository;

  constructor(
    resourceRepository?: ResourceRepository,
    topicRepository?: TopicRepository
  ) {
    this.resourceRepository = resourceRepository || new ResourceRepository();
    this.topicRepository = topicRepository || new TopicRepository();
  }

  async getAllResources(): Promise<IResource[]> {
    return await this.resourceRepository.findAll();
  }

  async getResourceById(id: string): Promise<IResource> {
    InputValidator.validateObjectId(id, 'Resource ID');

    const resource = await this.resourceRepository.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource');
    }

    return resource;
  }

  async createResource(resourceData: ICreateResourceDto): Promise<IResource> {
    this.validateCreateResourceData(resourceData);

    // Verify topic exists
    await this.validateTopicExists(resourceData.topicId);

    return await this.resourceRepository.create(resourceData);
  }

  async updateResource(id: string, updateData: IUpdateResourceDto): Promise<IResource> {
    InputValidator.validateObjectId(id, 'Resource ID');
    this.validateUpdateResourceData(updateData);

    // Verify resource exists
    await this.getResourceById(id);

    // If topicId is being updated, verify the new topic exists
    if (updateData.topicId) {
      await this.validateTopicExists(updateData.topicId);
    }

    const updatedResource = await this.resourceRepository.update(id, updateData);
    if (!updatedResource) {
      throw new NotFoundError('Resource');
    }

    return updatedResource;
  }

  async deleteResource(id: string): Promise<void> {
    InputValidator.validateObjectId(id, 'Resource ID');

    const deleted = await this.resourceRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Resource');
    }
  }

  async getResourcesByTopicId(topicId: string): Promise<IResource[]> {
    InputValidator.validateObjectId(topicId, 'Topic ID');

    // Verify topic exists
    await this.validateTopicExists(topicId);

    return await this.resourceRepository.findByTopicId(topicId);
  }

  async getResourcesByType(type: ResourceType): Promise<IResource[]> {
    this.validateResourceType(type);

    return await this.resourceRepository.findByType(type);
  }

  private validateCreateResourceData(data: ICreateResourceDto): void {
    if (!data.topicId || !data.url || !data.description || !data.type) {
      throw new ValidationError('TopicId, URL, description and type are required');
    }

    InputValidator.validateObjectId(data.topicId, 'Topic ID');
    this.validateUrl(data.url);
    InputValidator.validateStringLength(data.description, 'Description', 1, 500);
    this.validateResourceType(data.type);
  }

  private validateUpdateResourceData(data: IUpdateResourceDto): void {
    if (!data.topicId && !data.url && !data.description && !data.type) {
      throw new ValidationError('At least one field (topicId, url, description, type) must be provided');
    }

    if (data.topicId) {
      InputValidator.validateObjectId(data.topicId, 'Topic ID');
    }

    if (data.url) {
      this.validateUrl(data.url);
    }

    if (data.description) {
      InputValidator.validateStringLength(data.description, 'Description', 1, 500);
    }

    if (data.type) {
      this.validateResourceType(data.type);
    }
  }

  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new ValidationError('Invalid URL format');
    }
  }

  private validateResourceType(type: ResourceType): void {
    const validTypes = Object.values(ResourceType);
    if (!validTypes.includes(type)) {
      throw new ValidationError(`Invalid resource type. Valid types are: ${validTypes.join(', ')}`);
    }
  }

  private async validateTopicExists(topicId: string): Promise<void> {
    const topic = await this.topicRepository.findById(topicId);
    if (!topic) {
      throw new NotFoundError('Topic');
    }
  }
}
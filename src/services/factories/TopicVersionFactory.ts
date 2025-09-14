import { ITopic, ITopicVersion, ICreateTopicVersionDto, IUpdateTopicDto } from '../../models/interfaces';
import { v4 as uuidv4 } from 'uuid';

export class TopicVersionFactory {

  /**
   * Creates a new topic version from the initial topic creation
   */
  static createInitialVersion(topic: ITopic): ICreateTopicVersionDto {
    return {
      topicId: topic.id,
      name: topic.name,
      content: topic.content,
      version: 1,
      parentTopicId: topic.parentTopicId
    };
  }

  /**
   * Creates a new topic version from an update operation
   */
  static createNewVersion(
    currentTopic: ITopic,
    updateData: IUpdateTopicDto,
    newVersionNumber: number
  ): ICreateTopicVersionDto {
    return {
      topicId: currentTopic.id,
      name: updateData.name ?? currentTopic.name,
      content: updateData.content ?? currentTopic.content,
      version: newVersionNumber,
      parentTopicId: updateData.parentTopicId !== undefined
        ? updateData.parentTopicId
        : currentTopic.parentTopicId
    };
  }

  /**
   * Creates a topic version instance with full properties
   */
  static createTopicVersionInstance(data: ICreateTopicVersionDto): ITopicVersion {
    const now = new Date();

    return {
      id: uuidv4(),
      topicId: data.topicId,
      name: data.name,
      content: data.content,
      version: data.version,
      createdAt: now,
      updatedAt: now,
      parentTopicId: data.parentTopicId
    };
  }

  /**
   * Creates a snapshot version from any existing topic
   */
  static createSnapshotVersion(
    topic: ITopic,
    versionNumber?: number
  ): ICreateTopicVersionDto {
    return {
      topicId: topic.id,
      name: topic.name,
      content: topic.content,
      version: versionNumber ?? topic.version,
      parentTopicId: topic.parentTopicId
    };
  }

  /**
   * Validates version creation data
   */
  static validateVersionData(data: ICreateTopicVersionDto): boolean {
    return !!(
      data.topicId &&
      data.name &&
      data.content &&
      data.version &&
      data.version > 0
    );
  }

  /**
   * Factory method to create different types of versions based on context
   */
  static createVersion(
    type: 'initial' | 'update' | 'snapshot',
    topic: ITopic,
    updateData?: IUpdateTopicDto,
    versionNumber?: number
  ): ICreateTopicVersionDto {
    switch (type) {
      case 'initial':
        return this.createInitialVersion(topic);

      case 'update':
        if (!updateData || !versionNumber) {
          throw new Error('Update data and version number are required for update type');
        }
        return this.createNewVersion(topic, updateData, versionNumber);

      case 'snapshot':
        return this.createSnapshotVersion(topic, versionNumber);

      default:
        throw new Error(`Unknown version type: ${type}`);
    }
  }
}
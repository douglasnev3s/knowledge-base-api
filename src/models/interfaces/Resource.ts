export enum ResourceType {
  VIDEO = 'video',
  ARTICLE = 'article',
  PDF = 'pdf',
  LINK = 'link'
}

export interface IResource {
  id: string;
  topicId: string;
  url: string;
  description: string;
  type: ResourceType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateResourceDto {
  topicId: string;
  url: string;
  description: string;
  type: ResourceType;
}

export interface IUpdateResourceDto {
  url?: string;
  description?: string;
  type?: ResourceType;
}
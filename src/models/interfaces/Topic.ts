export interface ITopic {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  parentTopicId?: string; // ? = opcional (null for root topics)
}

export interface ICreateTopicDto {
  name: string;
  content: string;
  parentTopicId?: string;
}

export interface IUpdateTopicDto {
  name?: string;
  content?: string;
  parentTopicId?: string;
}

export interface ITopicVersion {
  id: string;
  topicId: string;
  name: string;
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  parentTopicId?: string;
}
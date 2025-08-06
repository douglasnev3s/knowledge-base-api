export interface ITopic {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  parentTopicId?: string;
}

export interface ICreateTopicDto {
  name: string;
  content: string;
  parentTopicId?: string;
}

export interface ICreateTopicVersionDto {
  topicId: string;
  name: string;
  content: string;
  version: number;
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

export interface ITopicTree {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  parentTopicId?: string;
  children: ITopicTree[];
}

export interface ITopicPath {
  startTopicId: string;
  endTopicId: string;
  path: string[];
  pathNames: string[];
  distance: number;
  found: boolean;
}
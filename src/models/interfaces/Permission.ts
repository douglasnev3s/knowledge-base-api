export interface IPermissionStrategy {
  canCreateUsers(): boolean;
  canUpdateUsers(): boolean;
  canDeleteUsers(): boolean;
  canViewUsers(): boolean;
  
  canCreateTopics(): boolean;
  canUpdateTopics(): boolean;
  canDeleteTopics(): boolean;
  canViewTopics(): boolean;
  canViewTopicVersions(): boolean;
  
  canCreateResources(): boolean;
  canUpdateResources(): boolean;
  canDeleteResources(): boolean;
  canViewResources(): boolean;
  
  canAccessShortestPath(): boolean;
  canAccessTopicTree(): boolean;
}

export interface IPermissionContext {
  userRole: string;
  strategy: IPermissionStrategy;
  setStrategy(strategy: IPermissionStrategy): void;
  hasPermission(action: string): boolean;
}

export enum PermissionAction {
  // User actions
  CREATE_USERS = 'CREATE_USERS',
  UPDATE_USERS = 'UPDATE_USERS', 
  DELETE_USERS = 'DELETE_USERS',
  VIEW_USERS = 'VIEW_USERS',
  
  // Topic actions
  CREATE_TOPICS = 'CREATE_TOPICS',
  UPDATE_TOPICS = 'UPDATE_TOPICS',
  DELETE_TOPICS = 'DELETE_TOPICS', 
  VIEW_TOPICS = 'VIEW_TOPICS',
  VIEW_TOPIC_VERSIONS = 'VIEW_TOPIC_VERSIONS',
  
  // Resource actions
  CREATE_RESOURCES = 'CREATE_RESOURCES',
  UPDATE_RESOURCES = 'UPDATE_RESOURCES',
  DELETE_RESOURCES = 'DELETE_RESOURCES',
  VIEW_RESOURCES = 'VIEW_RESOURCES',
  
  // Advanced actions
  ACCESS_SHORTEST_PATH = 'ACCESS_SHORTEST_PATH',
  ACCESS_TOPIC_TREE = 'ACCESS_TOPIC_TREE'
}
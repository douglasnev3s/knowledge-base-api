import { IPermissionStrategy } from '../../models/interfaces/Permission';

export class AdminPermissionStrategy implements IPermissionStrategy {
  canCreateUsers(): boolean { return true; }
  canUpdateUsers(): boolean { return true; }
  canDeleteUsers(): boolean { return true; }
  canViewUsers(): boolean { return true; }
  
  canCreateTopics(): boolean { return true; }
  canUpdateTopics(): boolean { return true; }
  canDeleteTopics(): boolean { return true; }
  canViewTopics(): boolean { return true; }
  canViewTopicVersions(): boolean { return true; }
  
  canCreateResources(): boolean { return true; }
  canUpdateResources(): boolean { return true; }
  canDeleteResources(): boolean { return true; }
  canViewResources(): boolean { return true; }
  
  canAccessShortestPath(): boolean { return true; }
  canAccessTopicTree(): boolean { return true; }
}
import { IPermissionStrategy } from '../../models/interfaces/Permission';

export class ViewerPermissionStrategy implements IPermissionStrategy {
  canCreateUsers(): boolean { return false; }
  canUpdateUsers(): boolean { return false; }
  canDeleteUsers(): boolean { return false; }
  canViewUsers(): boolean { return false; }
  
  canCreateTopics(): boolean { return false; }
  canUpdateTopics(): boolean { return false; }
  canDeleteTopics(): boolean { return false; }
  canViewTopics(): boolean { return true; }
  canViewTopicVersions(): boolean { return true; }
  
  canCreateResources(): boolean { return false; }
  canUpdateResources(): boolean { return false; }
  canDeleteResources(): boolean { return false; }
  canViewResources(): boolean { return true; }
  
  canAccessShortestPath(): boolean { return true; }
  canAccessTopicTree(): boolean { return true; }
}
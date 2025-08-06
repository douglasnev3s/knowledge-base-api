import { IPermissionStrategy } from '../../models/interfaces/Permission';

export class EditorPermissionStrategy implements IPermissionStrategy {
  canCreateUsers(): boolean { return false; }
  canUpdateUsers(): boolean { return false; }
  canDeleteUsers(): boolean { return false; }
  canViewUsers(): boolean { return false; }
  
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
import { IPermissionContext, IPermissionStrategy, PermissionAction } from '../../models/interfaces/Permission';

export class PermissionContext implements IPermissionContext {
  public userRole: string;
  public strategy: IPermissionStrategy;

  constructor(userRole: string, strategy: IPermissionStrategy) {
    this.userRole = userRole;
    this.strategy = strategy;
  }

  setStrategy(strategy: IPermissionStrategy): void {
    this.strategy = strategy;
  }

  hasPermission(action: string): boolean {
    switch (action) {
      // User permissions
      case PermissionAction.CREATE_USERS:
        return this.strategy.canCreateUsers();
      case PermissionAction.UPDATE_USERS:
        return this.strategy.canUpdateUsers();
      case PermissionAction.DELETE_USERS:
        return this.strategy.canDeleteUsers();
      case PermissionAction.VIEW_USERS:
        return this.strategy.canViewUsers();

      // Topic permissions
      case PermissionAction.CREATE_TOPICS:
        return this.strategy.canCreateTopics();
      case PermissionAction.UPDATE_TOPICS:
        return this.strategy.canUpdateTopics();
      case PermissionAction.DELETE_TOPICS:
        return this.strategy.canDeleteTopics();
      case PermissionAction.VIEW_TOPICS:
        return this.strategy.canViewTopics();
      case PermissionAction.VIEW_TOPIC_VERSIONS:
        return this.strategy.canViewTopicVersions();

      // Resource permissions
      case PermissionAction.CREATE_RESOURCES:
        return this.strategy.canCreateResources();
      case PermissionAction.UPDATE_RESOURCES:
        return this.strategy.canUpdateResources();
      case PermissionAction.DELETE_RESOURCES:
        return this.strategy.canDeleteResources();
      case PermissionAction.VIEW_RESOURCES:
        return this.strategy.canViewResources();

      // Advanced permissions
      case PermissionAction.ACCESS_SHORTEST_PATH:
        return this.strategy.canAccessShortestPath();
      case PermissionAction.ACCESS_TOPIC_TREE:
        return this.strategy.canAccessTopicTree();

      default:
        return false;
    }
  }
}
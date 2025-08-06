import { UserRole } from '../../models/interfaces';
import { IPermissionStrategy } from '../../models/interfaces/Permission';
import { AdminPermissionStrategy } from './AdminPermissionStrategy';
import { EditorPermissionStrategy } from './EditorPermissionStrategy';
import { ViewerPermissionStrategy } from './ViewerPermissionStrategy';
import { PermissionContext } from './PermissionContext';

export class PermissionFactory {
  
  static createStrategy(role: UserRole): IPermissionStrategy {
    switch (role) {
      case UserRole.ADMIN:
        return new AdminPermissionStrategy();
      case UserRole.EDITOR:
        return new EditorPermissionStrategy();
      case UserRole.VIEWER:
        return new ViewerPermissionStrategy();
      default:
        return new ViewerPermissionStrategy();
    }
  }

  static createPermissionContext(role: UserRole): PermissionContext {
    const strategy = this.createStrategy(role);
    return new PermissionContext(role, strategy);
  }
}
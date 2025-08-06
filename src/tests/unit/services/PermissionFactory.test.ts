import { PermissionFactory } from '../../../services/permissions/PermissionFactory';
import { UserRole, PermissionAction } from '../../../models/interfaces';
import { AdminPermissionStrategy } from '../../../services/permissions/AdminPermissionStrategy';
import { EditorPermissionStrategy } from '../../../services/permissions/EditorPermissionStrategy';
import { ViewerPermissionStrategy } from '../../../services/permissions/ViewerPermissionStrategy';

describe('PermissionFactory', () => {
  describe('createStrategy', () => {
    it('should create AdminPermissionStrategy for Admin role', () => {
      const strategy = PermissionFactory.createStrategy(UserRole.ADMIN);
      expect(strategy).toBeInstanceOf(AdminPermissionStrategy);
    });

    it('should create EditorPermissionStrategy for Editor role', () => {
      const strategy = PermissionFactory.createStrategy(UserRole.EDITOR);
      expect(strategy).toBeInstanceOf(EditorPermissionStrategy);
    });

    it('should create ViewerPermissionStrategy for Viewer role', () => {
      const strategy = PermissionFactory.createStrategy(UserRole.VIEWER);
      expect(strategy).toBeInstanceOf(ViewerPermissionStrategy);
    });
  });

  describe('createPermissionContext', () => {
    it('should create permission context with correct strategy', () => {
      const adminContext = PermissionFactory.createPermissionContext(UserRole.ADMIN);
      const editorContext = PermissionFactory.createPermissionContext(UserRole.EDITOR);
      const viewerContext = PermissionFactory.createPermissionContext(UserRole.VIEWER);

      expect(adminContext.userRole).toBe(UserRole.ADMIN);
      expect(editorContext.userRole).toBe(UserRole.EDITOR);
      expect(viewerContext.userRole).toBe(UserRole.VIEWER);

      // Test permission differences
      expect(adminContext.hasPermission(PermissionAction.CREATE_USERS)).toBe(true);
      expect(editorContext.hasPermission(PermissionAction.CREATE_USERS)).toBe(false);
      expect(viewerContext.hasPermission(PermissionAction.CREATE_USERS)).toBe(false);

      expect(adminContext.hasPermission(PermissionAction.CREATE_TOPICS)).toBe(true);
      expect(editorContext.hasPermission(PermissionAction.CREATE_TOPICS)).toBe(true);
      expect(viewerContext.hasPermission(PermissionAction.CREATE_TOPICS)).toBe(false);

      expect(adminContext.hasPermission(PermissionAction.VIEW_TOPICS)).toBe(true);
      expect(editorContext.hasPermission(PermissionAction.VIEW_TOPICS)).toBe(true);
      expect(viewerContext.hasPermission(PermissionAction.VIEW_TOPICS)).toBe(true);
    });

    it('should handle unknown permission actions', () => {
      const context = PermissionFactory.createPermissionContext(UserRole.ADMIN);
      expect(context.hasPermission('UNKNOWN_ACTION')).toBe(false);
    });
  });
});
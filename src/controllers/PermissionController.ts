import { Request, Response } from 'express';
import { PermissionAction } from '../models/interfaces';

export class PermissionController {
  
  // GET /permissions/check
  checkUserPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const permissions = req.user.permissions;
      
      const permissionCheck = {
        user: {
          id: req.user.id,
          role: req.user.role
        },
        permissions: {
          users: {
            create: permissions.hasPermission(PermissionAction.CREATE_USERS),
            view: permissions.hasPermission(PermissionAction.VIEW_USERS),
            update: permissions.hasPermission(PermissionAction.UPDATE_USERS),
            delete: permissions.hasPermission(PermissionAction.DELETE_USERS)
          },
          topics: {
            create: permissions.hasPermission(PermissionAction.CREATE_TOPICS),
            view: permissions.hasPermission(PermissionAction.VIEW_TOPICS),
            update: permissions.hasPermission(PermissionAction.UPDATE_TOPICS),
            delete: permissions.hasPermission(PermissionAction.DELETE_TOPICS),
            viewVersions: permissions.hasPermission(PermissionAction.VIEW_TOPIC_VERSIONS)
          },
          resources: {
            create: permissions.hasPermission(PermissionAction.CREATE_RESOURCES),
            view: permissions.hasPermission(PermissionAction.VIEW_RESOURCES),
            update: permissions.hasPermission(PermissionAction.UPDATE_RESOURCES),
            delete: permissions.hasPermission(PermissionAction.DELETE_RESOURCES)
          },
          advanced: {
            shortestPath: permissions.hasPermission(PermissionAction.ACCESS_SHORTEST_PATH),
            topicTree: permissions.hasPermission(PermissionAction.ACCESS_TOPIC_TREE)
          }
        }
      };

      res.json({
        success: true,
        data: permissionCheck
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
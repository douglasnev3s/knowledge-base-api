import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { PermissionFactory } from '../services/permissions';
import { PermissionAction } from '../models/interfaces';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        permissions: any;
      };
    }
  }
}

export class AuthMiddleware {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please provide x-user-id header.'
        });
        return;
      }

      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid user credentials'
        });
        return;
      }

      const permissionContext = PermissionFactory.createPermissionContext(user.role);

      req.user = {
        id: user.id,
        role: user.role,
        permissions: permissionContext
      };

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  static requirePermission(action: PermissionAction) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const hasPermission = req.user.permissions.hasPermission(action);
      
      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${action}`,
          userRole: req.user.role
        });
        return;
      }

      next();
    };
  }
}
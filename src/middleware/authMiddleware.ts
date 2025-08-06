import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { PermissionFactory } from '../services/permissions';
import { PermissionAction } from '../models/interfaces';
import { UnauthorizedError, ForbiddenError } from '../utils/errors/CustomErrors';
import { asyncHandler } from '../utils/asyncHandler';

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

  authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      throw new UnauthorizedError('Authentication required. Please provide x-user-id header.');
    }

    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new UnauthorizedError('Invalid user credentials');
    }

    // Criar contexto de permissões
    const permissionContext = PermissionFactory.createPermissionContext(user.role);

    // Adicionar ao request
    req.user = {
      id: user.id,
      role: user.role,
      permissions: permissionContext
    };

    next();
  });

  static requirePermission(action: PermissionAction) {
    return asyncHandler(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const hasPermission = req.user.permissions.hasPermission(action);
      
      if (!hasPermission) {
        throw new ForbiddenError(`Insufficient permissions. Required: ${action}`);
      }

      next();
    });
  }
}
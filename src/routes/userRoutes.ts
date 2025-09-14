import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/authMiddleware';
import { PermissionAction } from '../models/interfaces';

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

// Setup endpoint for initial user creation (no auth required)
router.post('/setup', userController.createUser);

router.use(authMiddleware.authenticate);

router.get('/', AuthMiddleware.requirePermission(PermissionAction.VIEW_USERS), userController.getAllUsers);
router.get('/:id', AuthMiddleware.requirePermission(PermissionAction.VIEW_USERS), userController.getUserById);
router.get('/email/:email', AuthMiddleware.requirePermission(PermissionAction.VIEW_USERS), userController.getUserByEmail);
router.post('/', AuthMiddleware.requirePermission(PermissionAction.CREATE_USERS), userController.createUser);
router.put('/:id', AuthMiddleware.requirePermission(PermissionAction.UPDATE_USERS), userController.updateUser);
router.delete('/:id', AuthMiddleware.requirePermission(PermissionAction.DELETE_USERS), userController.deleteUser);


export default router;
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { ICreateUserDto, IUpdateUserDto } from '../models/interfaces';
import { asyncHandler } from '../utils/asyncHandler';

export class UserController {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService || new UserService();
  }

  // GET /users
  getAllUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.getAllUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  });

  // GET /users/:id
  getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);

    res.json({
      success: true,
      data: user
    });
  });

  // GET /users/email/:email
  getUserByEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.params;
    const user = await this.userService.getUserByEmail(email);

    res.json({
      success: true,
      data: user
    });
  });

  // POST /users
  createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: ICreateUserDto = req.body;
    const newUser = await this.userService.createUser(userData);

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  });

  // PUT /users/:id
  updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: IUpdateUserDto = req.body;
    const updatedUser = await this.userService.updateUser(id, updateData);

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  });

  // DELETE /users/:id
  deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.userService.deleteUser(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  });
}
import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { ICreateUserDto, IUpdateUserDto } from '../models/interfaces';
import { asyncHandler } from '../utils/asyncHandler';
import { InputValidator } from '../utils/validators/inputValidator';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors/CustomErrors';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // GET /users
  getAllUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userRepository.findAll();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  });

  // GET /users/:id
  getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    InputValidator.validateObjectId(id, 'User ID');
    
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      data: user
    });
  });

  // GET /users/email/:email  
  getUserByEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.params;
    InputValidator.validateEmail(email);
    
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      data: user
    });
  });

  // POST /users
  createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData: ICreateUserDto = req.body;
    
    InputValidator.validateCreateUser(userData);

    try {
      const newUser = await this.userRepository.create(userData);
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        throw new ConflictError('Email already exists');
      }
      throw error; // Re-throw outros erros
    }
  });

  // PUT /users/:id
  updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: IUpdateUserDto = req.body;

    InputValidator.validateObjectId(id, 'User ID');

    if (!updateData.name && !updateData.email && !updateData.role) {
      throw new ValidationError('At least one field (name, email, role) must be provided');
    }

    // Validações opcionais
    if (updateData.name) {
      InputValidator.validateStringLength(updateData.name, 'Name', 2, 100);
    }
    if (updateData.email) {
      InputValidator.validateEmail(updateData.email);
    }
    if (updateData.role) {
      InputValidator.validateEnum(updateData.role, ['Admin', 'Editor', 'Viewer'], 'Role');
    }

    try {
      const updatedUser = await this.userRepository.update(id, updateData);
      
      if (!updatedUser) {
        throw new NotFoundError('User');
      }

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        throw new ConflictError('Email already exists');
      }
      throw error;
    }
  });

  // DELETE /users/:id
  deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    InputValidator.validateObjectId(id, 'User ID');
    
    const deleted = await this.userRepository.delete(id);
    
    if (!deleted) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  });
}
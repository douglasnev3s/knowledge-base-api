import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { ICreateUserDto, IUpdateUserDto, UserRole } from '../models/interfaces';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // GET /users
  getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.findAll();
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /users/:id
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userRepository.findById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /users/email/:email  
  getUserByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.params;
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /users
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: ICreateUserDto = req.body;
      
      // Validação básica
      if (!userData.name || !userData.email || !userData.role) {
        res.status(400).json({
          success: false,
          message: 'Name, email and role are required'
        });
        return;
      }

      // Validar role
      if (!Object.values(UserRole).includes(userData.role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role. Must be Admin, Editor or Viewer'
        });
        return;
      }

      const newUser = await this.userRepository.create(userData);
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // PUT /users/:id
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: IUpdateUserDto = req.body;

      // Validar se pelo menos um campo foi fornecido
      if (!updateData.name && !updateData.email && !updateData.role) {
        res.status(400).json({
          success: false,
          message: 'At least one field (name, email, role) must be provided'
        });
        return;
      }

      // Validar role se fornecido
      if (updateData.role && !Object.values(UserRole).includes(updateData.role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role. Must be Admin, Editor or Viewer'
        });
        return;
      }

      const updatedUser = await this.userRepository.update(id, updateData);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // DELETE /users/:id
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.userRepository.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
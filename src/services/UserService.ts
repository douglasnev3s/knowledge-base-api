import { IUser, ICreateUserDto, IUpdateUserDto } from '../models/interfaces';
import { UserRepository } from '../repositories/UserRepository';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors/CustomErrors';
import { InputValidator } from '../utils/validators/inputValidator';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository?: UserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  async getAllUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<IUser> {
    InputValidator.validateObjectId(id, 'User ID');

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<IUser> {
    InputValidator.validateEmail(email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async createUser(userData: ICreateUserDto): Promise<IUser> {
    this.validateCreateUserData(userData);

    try {
      return await this.userRepository.create(userData);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        throw new ConflictError('Email already exists');
      }
      throw error;
    }
  }

  async updateUser(id: string, updateData: IUpdateUserDto): Promise<IUser> {
    InputValidator.validateObjectId(id, 'User ID');
    this.validateUpdateUserData(updateData);

    // Verify user exists
    await this.getUserById(id);

    try {
      const updatedUser = await this.userRepository.update(id, updateData);
      if (!updatedUser) {
        throw new NotFoundError('User');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        throw new ConflictError('Email already exists');
      }
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    InputValidator.validateObjectId(id, 'User ID');

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('User');
    }
  }

  private validateCreateUserData(data: ICreateUserDto): void {
    InputValidator.validateCreateUser(data);
  }

  private validateUpdateUserData(data: IUpdateUserDto): void {
    if (!data.name && !data.email && !data.role) {
      throw new ValidationError('At least one field (name, email, role) must be provided');
    }

    if (data.name) {
      InputValidator.validateStringLength(data.name, 'Name', 2, 100);
    }

    if (data.email) {
      InputValidator.validateEmail(data.email);
    }

    if (data.role) {
      InputValidator.validateEnum(data.role, ['Admin', 'Editor', 'Viewer'], 'Role');
    }
  }
}
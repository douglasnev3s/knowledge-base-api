import { BaseRepository } from './BaseRepository';
import { IUser, ICreateUserDto, IUpdateUserDto, UserRole } from '../models/interfaces';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository extends BaseRepository<IUser, ICreateUserDto, IUpdateUserDto> {
  
  constructor() {
    super('users.json');
  }

  async create(data: ICreateUserDto): Promise<IUser> {
    const users = await this.readData();
    
    const existingUser = users.find(user => user.email === data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser: IUser = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);
    await this.writeData(users);
    
    return newUser;
  }

  async update(id: string, data: IUpdateUserDto): Promise<IUser | null> {
    const users = await this.readData();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;

    if (data.email && data.email !== users[userIndex].email) {
      const existingUser = users.find(user => user.email === data.email && user.id !== id);
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    const updatedUser: IUser = {
      ...users[userIndex],
      ...data, // Sobrescreve apenas campos fornecidos
      updatedAt: new Date()
    };

    users[userIndex] = updatedUser;
    await this.writeData(users);
    
    return updatedUser;
  }

  // Métodos específicos para User
  async findByEmail(email: string): Promise<IUser | null> {
    const users = await this.readData();
    return users.find(user => user.email === email) || null;
  }

  async findByRole(role: UserRole): Promise<IUser[]> {
    const users = await this.readData();
    return users.filter(user => user.role === role);
  }
}
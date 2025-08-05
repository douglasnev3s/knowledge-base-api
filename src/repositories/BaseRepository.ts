import { promises as fs } from 'fs';
import path from 'path';
import { IBaseRepository } from './interfaces/IBaseRepository';

export abstract class BaseRepository<T extends { id: string; createdAt: Date; updatedAt: Date }, CreateDto, UpdateDto> 
  implements IBaseRepository<T, CreateDto, UpdateDto> {
  
  protected filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), 'data', fileName);
  }

  protected async readData(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data, this.dateReviver);
    } catch (error) {
      return [];
    }
  }

  protected async writeData(data: T[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  // Converte strings de data de volta para Date objects
  private dateReviver(key: string, value: any): any {
    if (key === 'createdAt' || key === 'updatedAt') {
      return new Date(value);
    }
    return value;
  }

  async findAll(): Promise<T[]> {
    return await this.readData();
  }

  async findById(id: string): Promise<T | null> {
    const data = await this.readData();
    return data.find(item => item.id === id) || null;
  }

  abstract create(data: CreateDto): Promise<T>;
  abstract update(id: string, data: UpdateDto): Promise<T | null>;

  async delete(id: string): Promise<boolean> {
    const data = await this.readData();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    data.splice(index, 1);
    await this.writeData(data);
    return true;
  }
}
import { ValidationError } from '../errors/CustomErrors';

export class InputValidator {
  
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  static validateRequired(value: any, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`${fieldName} is required`);
    }
  }

  static validateStringLength(value: string, fieldName: string, min: number, max: number): void {
    if (value.length < min || value.length > max) {
      throw new ValidationError(`${fieldName} must be between ${min} and ${max} characters`);
    }
  }

  static validateURL(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new ValidationError('Invalid URL format');
    }
  }

  static validateEnum<T>(value: T, validValues: T[], fieldName: string): void {
    if (!validValues.includes(value)) {
      throw new ValidationError(`${fieldName} must be one of: ${validValues.join(', ')}`);
    }
  }

  static validateObjectId(id: string, fieldName: string = 'ID'): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError(`${fieldName} must be a valid string`);
    }
  }

  // Validação específica para criar usuário
  static validateCreateUser(data: any): void {
    this.validateRequired(data.name, 'Name');
    this.validateRequired(data.email, 'Email');
    this.validateRequired(data.role, 'Role');
    
    this.validateStringLength(data.name, 'Name', 2, 100);
    this.validateEmail(data.email);
    this.validateEnum(data.role, ['Admin', 'Editor', 'Viewer'], 'Role');
  }

  // Validação específica para criar topic
  static validateCreateTopic(data: any): void {
    this.validateRequired(data.name, 'Name');
    this.validateRequired(data.content, 'Content');
    
    this.validateStringLength(data.name, 'Name', 3, 200);
    this.validateStringLength(data.content, 'Content', 10, 5000);
    
    if (data.parentTopicId) {
      this.validateObjectId(data.parentTopicId, 'Parent Topic ID');
    }
  }

  // Validação específica para criar resource
  static validateCreateResource(data: any): void {
    this.validateRequired(data.topicId, 'Topic ID');
    this.validateRequired(data.url, 'URL');
    this.validateRequired(data.description, 'Description');
    this.validateRequired(data.type, 'Type');
    
    this.validateObjectId(data.topicId, 'Topic ID');
    this.validateURL(data.url);
    this.validateStringLength(data.description, 'Description', 5, 500);
    this.validateEnum(data.type, ['video', 'article', 'pdf', 'link'], 'Type');
  }
}
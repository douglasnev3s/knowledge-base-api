export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Manter stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class InternalServerError extends BaseError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, false);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}
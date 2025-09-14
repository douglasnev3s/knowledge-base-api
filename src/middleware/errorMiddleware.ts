import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../utils/errors/CustomErrors';

export interface IErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path: string;
  stack?: string;
}

export class ErrorHandler {
  
  // Middleware to catch errors
  static handleError = (error: Error, req: Request, res: Response, _next: NextFunction): void => {
    console.error('🚨 Error caught by middleware:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    const errorResponse: IErrorResponse = {
      success: false,
      message: 'An error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: req.path
    };

    // If it's a custom error
    if (error instanceof BaseError) {
      errorResponse.statusCode = error.statusCode;
      errorResponse.message = error.message;
      
      // If operational, show details
      if (error.isOperational) {
        errorResponse.error = error.message;
      }
    } 
    // Express validation errors
    else if (error.name === 'ValidationError') {
      errorResponse.statusCode = 400;
      errorResponse.message = 'Validation failed';
      errorResponse.error = error.message;
    }
    // Malformed JSON error
    else if (error instanceof SyntaxError && 'body' in error) {
      errorResponse.statusCode = 400;
      errorResponse.message = 'Invalid JSON format';
      errorResponse.error = 'Request body contains invalid JSON';
    }
    // Non-operational errors (system bugs)
    else {
      errorResponse.statusCode = 500;
      errorResponse.message = 'Internal server error';
      
      // In development, show stack trace
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        errorResponse.stack = error.stack;
        errorResponse.error = error.message;
      }
    }

    res.status(errorResponse.statusCode).json(errorResponse);
  };

  // Middleware to handle 404 routes
  static handle404 = (req: Request, res: Response): void => {
    const errorResponse: IErrorResponse = {
      success: false,
      message: 'Route not found',
      error: `Cannot ${req.method} ${req.path}`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path
    };

    res.status(404).json(errorResponse);
  };

  // Non-operational error logger
  static logError = (error: Error): void => {
    if (error instanceof BaseError && error.isOperational) {
      // Operational error - simple log
      console.warn('⚠️ Operational error:', error.message);
    } else {
      // Critical error - full log
      console.error('💥 Critical error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Check if error is trusted for crash
  static isTrustedError = (error: Error): boolean => {
    if (error instanceof BaseError) {
      return error.isOperational;
    }
    return false;
  };
}
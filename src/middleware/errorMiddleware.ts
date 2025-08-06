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
  
  // Middleware para capturar erros
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

    // Se é um erro customizado
    if (error instanceof BaseError) {
      errorResponse.statusCode = error.statusCode;
      errorResponse.message = error.message;
      
      // Se é operacional, mostrar detalhes
      if (error.isOperational) {
        errorResponse.error = error.message;
      }
    } 
    // Erros de validação do Express
    else if (error.name === 'ValidationError') {
      errorResponse.statusCode = 400;
      errorResponse.message = 'Validation failed';
      errorResponse.error = error.message;
    }
    // Erro de JSON malformado
    else if (error instanceof SyntaxError && 'body' in error) {
      errorResponse.statusCode = 400;
      errorResponse.message = 'Invalid JSON format';
      errorResponse.error = 'Request body contains invalid JSON';
    }
    // Erros não operacionais (bugs do sistema)
    else {
      errorResponse.statusCode = 500;
      errorResponse.message = 'Internal server error';
      
      // Em desenvolvimento, mostrar stack
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        errorResponse.stack = error.stack;
        errorResponse.error = error.message;
      }
    }

    res.status(errorResponse.statusCode).json(errorResponse);
  };

  // Middleware para capturar rotas 404
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

  // Logger de erros não operacionais
  static logError = (error: Error): void => {
    if (error instanceof BaseError && error.isOperational) {
      // Erro operacional - log simples
      console.warn('⚠️ Operational error:', error.message);
    } else {
      // Erro crítico - log completo
      console.error('💥 Critical error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Verificar se é erro confiável para crash
  static isTrustedError = (error: Error): boolean => {
    if (error instanceof BaseError) {
      return error.isOperational;
    }
    return false;
  };
}
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { ErrorHandler } from './middleware/errorMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api', routes);

app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

app.use(ErrorHandler.handleError);

process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  ErrorHandler.logError(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('💥 Unhandled Rejection:', reason);
  if (reason instanceof Error) {
    ErrorHandler.logError(reason);
  }
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
});
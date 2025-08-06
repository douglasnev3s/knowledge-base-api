import { promises as fs } from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from '../../routes';

export function createTestApp() {
  const app = express();

  // Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());

  // Routes
  app.use('/api', routes);

  return app;
}

export async function cleanTestData(): Promise<void> {
  const testDataDir = path.join(process.cwd(), 'data');
  
  try {
    await fs.mkdir(testDataDir, { recursive: true });
    
    const testFiles = [
      'users.json',
      'topics.json', 
      'resources.json',
      'topic-versions.json'
    ];
    
    for (const file of testFiles) {
      const filePath = path.join(testDataDir, file);
      await fs.writeFile(filePath, '[]', 'utf-8');
    }
  } catch (error) {
    console.error('Test cleanup error:', error);
  }
}

export const testUsers = {
  admin: {
    name: 'Test Admin',
    email: 'admin@test.com',
    role: 'Admin' as const
  },
  editor: {
    name: 'Test Editor', 
    email: 'editor@test.com',
    role: 'Editor' as const
  },
  viewer: {
    name: 'Test Viewer',
    email: 'viewer@test.com', 
    role: 'Viewer' as const
  }
};
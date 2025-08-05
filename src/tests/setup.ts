import { promises as fs } from 'fs';
import path from 'path';

beforeEach(async () => {
  const testDataDir = path.join(process.cwd(), 'data');
  
  try {
    const files = await fs.readdir(testDataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const filePath = path.join(testDataDir, file);
      await fs.writeFile(filePath, '[]', 'utf-8');
    }
  } catch (error) {
    console.log('Test data directory not found, skipping cleanup');
  }
});

jest.setTimeout(10000);
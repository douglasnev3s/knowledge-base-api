import { promises as fs } from 'fs';
import path from 'path';

beforeEach(async () => {
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
    // Ignore errors in tests
  }
});

afterAll(async () => {
  const testDataDir = path.join(process.cwd(), 'data');
  
  try {
    const files = await fs.readdir(testDataDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(testDataDir, file));
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});

jest.setTimeout(15000);
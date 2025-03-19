import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create dist directory if it doesn't exist
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
}

// Create database directory in dist if it doesn't exist
const dbPath = path.join(distPath, 'database');
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
}

// Ensure frontend build directory exists in expected location
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const backendFrontendPath = path.join(__dirname, 'frontend');

try {
  // Check if frontend dist directory exists
  if (!fs.existsSync(frontendDistPath)) {
    console.warn('Frontend build not found at', frontendDistPath);
    console.warn('Make sure to build the frontend before building the backend');
  } else {
    console.log('Frontend build found, will be included in backend package');
    
    // Ensure target directory exists
    if (!fs.existsSync(backendFrontendPath)) {
      fs.mkdirSync(backendFrontendPath, { recursive: true });
    }
  }
} catch (error) {
  console.error('Error checking frontend build:', error);
}

// Copy necessary files
const filesToCopy = [
    { src: '.env', dest: 'dist/.env' },
    { src: 'config', dest: 'dist/config' },
    { src: 'models', dest: 'dist/models' }
];

filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file.src);
    const destPath = path.join(__dirname, file.dest);

    if (fs.existsSync(srcPath)) {
        if (fs.lstatSync(srcPath).isDirectory()) {
            fs.cpSync(srcPath, destPath, { recursive: true });
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
});

console.log('Build preparation completed!');
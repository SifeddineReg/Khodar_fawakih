#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Khodar wa Fawakih...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v14 or higher.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm version: ${npmVersion.trim()}\n`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm.');
  process.exit(1);
}

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
  execSync('npm install', { cwd: './client', stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies.');
  process.exit(1);
}

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('npm install', { cwd: './server', stdio: 'inherit' });
  console.log('✅ Backend dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install backend dependencies.');
  process.exit(1);
}

console.log('🎉 Setup completed successfully!\n');
console.log('To start the game:');
console.log('1. Start the backend: cd server && npm run dev');
console.log('2. Start the frontend: cd client && npm run dev');
console.log('3. Open http://localhost:3000 in your browser\n');
console.log('🍎🥬 Enjoy playing Khodar wa Fawakih!');

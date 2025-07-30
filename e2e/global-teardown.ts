import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalTeardown(config: FullConfig) {
  console.log('Bringing down Docker Compose services...');
  execSync('docker-compose down', { stdio: 'inherit' });
  console.log('Docker Compose services are down.');
}

export default globalTeardown;
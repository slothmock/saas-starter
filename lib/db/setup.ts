import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

const mode = process.argv.includes('--prod') ? 'production' : 'local';
const isProd = mode === 'production';
console.log(`Running setup in [${isProd ? 'Production' : 'Development'} Mode]`);

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function checkStripeCLI() {
  console.log('Step 1: Checking if Stripe CLI is installed and authenticated...');
  try {
    await execAsync('stripe --version');
    console.log('✅ Stripe CLI is installed.');

    try {
      await execAsync('stripe config --list');
      console.log('✅ Stripe CLI is authenticated.');
    } catch {
      console.log('❌ Stripe CLI is not authenticated or has expired.');
      console.log('Run: stripe login');
      const answer = await question('Have you completed the authentication? (y/n): ');
      if (answer.toLowerCase() !== 'y') {
        console.log('Please authenticate and re-run the script.');
        process.exit(1);
      }

      try {
        await execAsync('stripe config --list');
        console.log('✅ Stripe CLI authentication confirmed.');
      } catch {
        console.error('❌ Authentication still not valid. Try again.');
        process.exit(1);
      }
    }
  } catch {
    console.error('❌ Stripe CLI not installed.');
    console.log('Install from: https://docs.stripe.com/stripe-cli');
    process.exit(1);
  }
}

function generateDBPass(): string {
  console.log('Step 2: Generating Postgres DB password...');
  const salt = crypto.randomBytes(16).toString('hex');
  return crypto.pbkdf2Sync('pembswastesms', salt, 100000, 64, 'sha512').toString('hex');
}

async function setupDockerPostgres(dbPassword: string) {
  console.log('🔧 Setting up Postgres instance via Docker...');

  try {
    await execAsync('docker --version');
    console.log('✅ Docker is installed.');
  } catch {
    console.error('❌ Docker is not installed. Visit https://docs.docker.com/get-docker/');
    process.exit(1);
  }

  const dockerComposeContent = `
services:
  postgres:
    image: postgres:16.4-alpine
    restart: always
    container_name: pembswastesms.local
    environment:
      POSTGRES_DB: pembs
      POSTGRES_USER: wasteadmin
      POSTGRES_PASSWORD: ${dbPassword}
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await fs.writeFile(path.join(process.cwd(), 'docker-compose.yml'), dockerComposeContent.trim());
  console.log('✅ docker-compose.yml created.');

  try {
    await execAsync('docker compose up -d');
    console.log('✅ Docker container [pembswastesms.local] started.');
  } catch (err) {
    console.error('❌ Failed to start Docker container.');
    process.exit(1);
  }
}

async function getPostgresURL(dbPassword: string): Promise<string> {
  await setupDockerPostgres(dbPassword);
  return `postgres://wasteadmin:${encodeURIComponent(dbPassword)}@localhost:54322/pembs`;
}

async function getStripeSecretKey(): Promise<string> {
  console.log('Step 3: Getting Stripe Secret Key...');
  console.log('Visit: https://dashboard.stripe.com/test/apikeys');
  return await question('Enter your Stripe Secret Key: ');
}

async function createStripeWebhook(): Promise<string> {
  console.log('Step 4: Creating Stripe webhook...');
  try {
    const { stdout } = await execAsync('stripe listen --print-secret');
    const match = stdout.match(/whsec_[a-zA-Z0-9]+/);
    if (!match) throw new Error('No webhook secret found in output.');
    console.log('✅ Stripe webhook secret obtained.');
    return match[0];
  } catch (err) {
    console.error('❌ Failed to create webhook. Check your Stripe CLI permissions.');
    if (os.platform() === 'win32') {
      console.log('🔔 Note: On Windows, you might need to run this as Administrator.');
    }
    process.exit(1);
  }
}

function generateAuthSecret(): string {
  console.log('Step 5: Generating AUTH_SECRET...');
  return crypto.randomBytes(32).toString('hex');
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log('Step 6: Writing .env file...');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const filePath = isProd ? path.join(process.cwd(), '.env.production') : path.join(process.cwd(), '.env.local');
  console.log('Writing file to:', filePath);
  await fs.writeFile(filePath, envContent);
  console.log('✅ .env file written.');
}

async function main() {
  await checkStripeCLI();

  const dbPassword = generateDBPass();
  const DATABASE_URL = await getPostgresURL(dbPassword);
  const STRIPE_SECRET_KEY = await getStripeSecretKey();
  const STRIPE_WEBHOOK_SECRET = await createStripeWebhook();
  const BASE_URL = isProd ? 'https://pembswastesms.uk' : 'http://localhost:3000';
  const AUTH_SECRET = generateAuthSecret();

  const NEXT_PUBLIC_SUPABASE_URL = 'https://jfhizzbxoxsxwnxenlnf.supabase.co';
  const NEXT_PUBLIC_SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmaGl6emJ4b3hzeHdueGVubG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MDAzNTksImV4cCI6MjA2Mjk3NjM1OX0.fBMzHRgFFO5lZwikxwBUdEeTR89FXHZaHKkLDdyIuZE';

  await writeEnvFile({
    DATABASE_URL,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    BASE_URL,
    AUTH_SECRET,
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  console.log('🎉 Setup completed successfully!');
}

main().catch((err) => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});

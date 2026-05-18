import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startAll() {
  try {
    console.log('Starting MongoDB Memory Server...');
    // We let MongoMemoryServer choose a random available port automatically
    const mongod = await MongoMemoryServer.create();

    const uri = mongod.getUri();
    console.log(`MongoDB Memory Server running at: ${uri}`);

    // Set URI in environment for server.js
    process.env.MONGODB_URI = uri;

    // Also seed the DB natively
    const seedProcess = spawn('node', ['server/src/seedData.js'], {
        stdio: 'inherit',
        env: process.env,
        shell: true
    });

    seedProcess.on('close', (code) => {
        if (code === 0) {
            // Start concurrently the frontend and backend
            console.log('Starting backend and frontend...');
            const concurrently = spawn('npm', ['run', 'dev'], {
              stdio: 'inherit',
              env: process.env,
              shell: true
            });

            concurrently.on('close', (code) => {
              console.log(`Dev processes exited with code ${code}`);
              mongod.stop();
              process.exit(code);
            });

            process.on('SIGINT', async () => {
              console.log('Stopping MongoDB Memory Server...');
              concurrently.kill('SIGINT');
              await mongod.stop();
              process.exit(0);
            });
        } else {
             console.log(`Seed process failed with code ${code}`);
             mongod.stop();
             process.exit(code);
        }
    })
  } catch (err) {
    console.error('Error starting environment:', err);
    process.exit(1);
  }
}

startAll();

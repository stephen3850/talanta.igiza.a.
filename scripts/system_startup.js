// System Startup & Process Launch Management Service
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, exec } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const LOGS_DIR = path.join(PROJECT_ROOT, 'logs');
const PID_FILE = path.join(LOGS_DIR, 'talanta_app.pid');
const LOG_FILE = path.join(LOGS_DIR, 'startup.log');

function logMessage(msg) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] ${msg}`;
  console.log(formatted);
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, formatted + '\n', 'utf8');
}

function pollHealthEndpoint(url, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve(true);
        }
      }).on('error', () => {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error(`Server at ${url} failed to respond after ${maxAttempts} attempts.`));
        }
      });
    }, 1000);
  });
}

function openBrowser(url) {
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} ${url}`, (err) => {
    if (err) {
      logMessage(`Could not automatically open browser: ${err.message}`);
    } else {
      logMessage(`Opened default browser to ${url}`);
    }
  });
}

async function startSystem() {
  logMessage('================================================================');
  logMessage('TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE - LAUNCHING SYSTEM');
  logMessage('================================================================');

  // Check if PID file exists and process is running
  if (fs.existsSync(PID_FILE)) {
    const existingPid = fs.readFileSync(PID_FILE, 'utf8').trim();
    if (existingPid) {
      logMessage(`Existing server PID found (${existingPid}). Verifying health...`);
      try {
        const healthy = await pollHealthEndpoint('http://localhost:3000/api/health', 3);
        if (healthy) {
          logMessage('Application server is already running and healthy.');
          openBrowser('http://localhost:3000/startup');
          return;
        }
      } catch {
        logMessage('Stale PID file detected. Cleaning up and restarting server...');
        try { fs.unlinkSync(PID_FILE); } catch {}
      }
    }
  }

  logMessage('Spawning Next.js development server process...');
  const child = spawn('npm', ['run', 'dev'], {
    cwd: PROJECT_ROOT,
    detached: true,
    stdio: 'ignore',
    shell: true,
  });

  child.unref();

  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
  fs.writeFileSync(PID_FILE, String(child.pid), 'utf8');
  logMessage(`Process spawned with PID ${child.pid}. Wrote PID to ${PID_FILE}`);

  logMessage('Awaiting application health endpoint verification at http://localhost:3000/api/health...');
  try {
    await pollHealthEndpoint('http://localhost:3000/api/health', 35);
    logMessage('SYSTEM HEALTH VERIFIED: Next.js application server is online and healthy!');
    logMessage('Launching Talanta Stadium Operations Startup Experience in default browser...');
    openBrowser('http://localhost:3000/startup');
  } catch (err) {
    logMessage(`HEALTH CHECK WARNING: ${err.message}`);
    logMessage('Attempting to open browser at http://localhost:3000/startup anyway...');
    openBrowser('http://localhost:3000/startup');
  }
}

if (require.main === module) {
  startSystem().catch((err) => {
    logMessage(`SYSTEM STARTUP ERROR: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { startSystem };

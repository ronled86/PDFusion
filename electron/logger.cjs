const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'log');
const logFile = path.join(logDir, 'electron.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function logToFile(...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => {
    if (typeof arg === 'object') {
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}\n${arg.stack}`;
      }
      return JSON.stringify(arg, null, 2);
    }
    return String(arg);
  }).join(' ');
  
  const logEntry = `[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
  
  // Also log to console for development
  console.log(`[${timestamp}]`, ...args);
}

// Log startup info
logToFile("=== Electron Logger Started ===");
logToFile("Node version:", process.version);
logToFile("Electron version:", process.versions.electron);
logToFile("Platform:", process.platform);
logToFile("Architecture:", process.arch);
logToFile("Working directory:", process.cwd());
logToFile("__dirname:", __dirname);

module.exports = { logToFile };

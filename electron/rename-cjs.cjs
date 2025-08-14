const fs = require('fs');
const path = require('path');

// Rename .js files to .cjs files in the electron directory
const electronDir = __dirname;

const filesToRename = [
  { from: 'main.js', to: 'main.cjs' },
  { from: 'preload.js', to: 'preload.cjs' }
];

filesToRename.forEach(({ from, to }) => {
  const fromPath = path.join(electronDir, from);
  const toPath = path.join(electronDir, to);
  
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Renamed ${from} to ${to}`);
  }
});

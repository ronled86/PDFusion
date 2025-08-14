#!/usr/bin/env pwsh

# Kill any old Electron or Vite dev server processes
Get-Process electron,vite -ErrorAction SilentlyContinue | ForEach-Object { $_.CloseMainWindow(); Start-Sleep -Seconds 2; if (!$_.HasExited) { $_.Kill() } }

# Start the app
npm run start

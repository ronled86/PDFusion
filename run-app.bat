@echo off
REM Kill any old Electron or Vite dev server processes
taskkill /f /im electron.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

REM Wait a moment for processes to fully terminate
timeout /t 2 /nobreak >nul

REM Start Vite development server only (Electron may not be available due to SSL issues)
echo Starting Vite development server...
echo Note: If you need Electron, you may need to resolve SSL certificate issues first.
echo Opening browser at http://localhost:6005
npm run dev

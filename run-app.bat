@echo off
echo Starting PDFusion...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the application (both web server and Electron)
echo Starting PDFusion application...
npm start

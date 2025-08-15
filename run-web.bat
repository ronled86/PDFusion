@echo off
echo Starting PDFusion Web Version...
echo.
echo Open your browser to: http://localhost:6005
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the web development server
npm run dev

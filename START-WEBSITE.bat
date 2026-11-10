@echo off
title Class 12 Commerce - Server Launcher
cd /d "F:\WEBSITE FOR STUDIES"

echo ===================================================
echo   CLASS 12 COMMERCE STUDY PLATFORM
echo   Starting development server...
echo ===================================================
echo.
echo Website will open automatically in your browser...
echo Local Address: http://localhost:3000
echo.

start http://localhost:3000
npm run dev
pause

@echo off
setlocal enabledelayedexpansion
title TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE LAUNCHER

echo ================================================================================
echo TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE - SYSTEM STARTUP ^& LAUNCHER
echo Developed by ST-Tech ICT Consultants - Ministry of Sports
echo ================================================================================
echo.

cd /d "%~dp0"
echo [1/8] Locating project directory: %CD%

:: Check Node.js
echo [2/8] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed or not added to system PATH.
    echo Please install Node.js (v18 or higher) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo       Node.js version: %NODE_VER%

:: Check npm
echo [3/8] Checking npm version...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is NOT installed or not added to system PATH.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
echo       npm version: %NPM_VER%

:: Check dependencies
echo [4/8] Checking project dependencies...
if not exist "node_modules\" (
    echo [WARNING] node_modules not found. Installing project dependencies...
    cmd /c npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Dependency installation failed.
        echo.
        pause
        exit /b 1
    )
) else (
    echo       Dependencies folder verified.
)

:: Check environment
echo [5/8] Checking environment configuration...
if not exist ".env" (
    echo [WARNING] .env file missing. Creating from .env.example fallback...
    if exist ".env.example" (
        copy .env.example .env >nul
        echo       Created default .env configuration file.
    ) else (
        echo [WARNING] .env.example missing. Application will run with default fallbacks.
    )
) else (
    echo       Environment configuration file verified.
)

:: Run readiness check script
echo [6/8] Executing system readiness checks...
node scripts/system_readiness.js
if %errorlevel% neq 0 (
    echo [ERROR] System readiness checks failed. Review messages above.
    echo.
    pause
    exit /b 1
)

:: Check logs directory
if not exist "logs\" mkdir logs

:: Launch system startup script
echo [7/8] Preparing application services...
echo [8/8] Launching Talanta Stadium application server and opening startup interface...
node scripts/system_startup.js

echo.
echo ================================================================================
echo Startup script completed. The application is running in the background.
echo Access the system at: http://localhost:3000/startup
echo ================================================================================
echo.
pause

@echo off
title TALANTA STADIUM SYSTEM RESTART CONTROL

echo ================================================================================
echo TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE - RESTARTING SYSTEM
echo ================================================================================
echo.

cd /d "%~dp0"

echo [1/2] Stopping existing application services...
if exist "logs\talanta_app.pid" (
    for /f "tokens=*" %%p in (logs\talanta_app.pid) do (
        taskkill /F /T /PID %%p 2>nul
    )
    del "logs\talanta_app.pid" 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo [2/2] Launching system startup process...
call start_system.bat

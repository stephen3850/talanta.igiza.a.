@echo off
title TALANTA STADIUM SYSTEM STOP CONTROL

echo ================================================================================
echo TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE - STOPPING SYSTEM
echo ================================================================================
echo.

cd /d "%~dp0"

if exist "logs\talanta_app.pid" (
    for /f "tokens=*" %%p in (logs\talanta_app.pid) do set APP_PID=%%p
    echo Stopping tracked application process (PID: !APP_PID!)...
    taskkill /F /T /PID !APP_PID! 2>nul
    del "logs\talanta_app.pid" 2>nul
    echo Application server process terminated safely.
) else (
    echo [NOTICE] No tracked PID file found in logs\talanta_app.pid.
    echo Stopping any Node.js processes bound to port 3000...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
        echo Terminating process on port 3000 (PID: %%a)...
        taskkill /F /PID %%a 2>nul
    )
)

echo.
echo ================================================================================
echo System stopped successfully.
echo ================================================================================
echo.
pause

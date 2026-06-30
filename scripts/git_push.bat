@echo off
echo ====================================
echo   Ziwei Web - Git Auto Push
echo ====================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo Error: Git is not installed!
    pause
    exit /b 1
)

REM Init git if not already
if not exist ".git" (
    echo Initializing git...
    git init
)

REM Check remote
git remote -v | findstr "origin" >nul
if errorlevel 1 (
    set /p REMOTE_URL="Enter GitHub repo URL (e.g. https://github.com/user/repo.git): "
    if "!REMOTE_URL!"=="" (
        echo Error: URL cannot be empty!
        pause
        exit /b 1
    )
    git remote add origin !REMOTE_URL!
)

REM Get commit message
set /p COMMIT_MSG="Commit message (default: update): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=update

echo.
echo Adding files...
git add .

echo Committing: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

echo Pushing to origin...
git push -u origin main

if errorlevel 1 (
    echo.
    echo Push failed! Trying push to master...
    git push -u origin master
)

echo.
echo ====================================
echo   Done!
echo ====================================
pause

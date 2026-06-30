@echo off
echo ====================================
echo   Ziwei - Full Deploy
echo ====================================
echo.

REM Check Vercel CLI
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Vercel CLI not found! Installing...
    npm i -g vercel
)

echo [1/3] Git push...
call scripts\git_push.bat

echo.
echo [2/3] Deploy to Vercel...
vercel --prod

echo.
echo [3/3] Done!
echo ====================================
echo   Web: Deployed to Vercel
echo   Flutter: Update API_BASE_URL
echo ====================================
pause

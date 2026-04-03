@echo off
rem Run SenNoflaay locally using SQLite and open Microsoft Edge

rem Change to the project directory (update this path if needed)
cd /d "C:\Users\Ali\Desktop\Dev\SenNoflaay\SenNoflaay"

rem Start the dev server in a new window (so this script can continue)
start "SenNoflaay" cmd /k "npm run dev:sqlite"

rem Wait a moment to allow the server to start
timeout /t 2 /nobreak >nul

rem Open a new tab in Microsoft Edge to the frontend
start msedge "http://localhost:3000"
pause


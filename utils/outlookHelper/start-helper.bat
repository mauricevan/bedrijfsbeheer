@echo off
echo Starting Outlook Helper Server...
echo.
echo Deze helper maakt direct drag-and-drop vanuit Outlook mogelijk.
echo Laat dit venster open staan terwijl je werkt.
echo.
cd /d %~dp0
node server.js
pause








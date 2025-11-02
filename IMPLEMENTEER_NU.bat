@echo off
echo ========================================
echo  DIRECTE IMPLEMENTATIE
echo ========================================
echo.
echo Dit script voegt toe:
echo - DollarSign import
echo - CustomerFinancials modal
echo - Financien knop
echo - State variable
echo.

cd /d "%~dp0"

python implementeer_nu.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUCCES! ✅
    echo ========================================
    echo.
    echo Start nu de app:
    echo   npm run dev
    echo.
    echo Ga naar CRM en klik op "Financien" bij een klant
    echo.
) else (
    echo.
    echo ========================================
    echo  ERROR ❌
    echo ========================================
    echo.
    echo Check de output hierboven voor details
    echo.
)

pause

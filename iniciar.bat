@echo off
chcp 65001 >nul
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 servidor.py
  goto :fin
)
where python >nul 2>nul
if %errorlevel%==0 (
  python servidor.py
  goto :fin
)
echo.
echo No encontre Python instalado.
echo Instalalo desde https://www.python.org/downloads/ (tilda "Add python.exe to PATH") y volve a abrir este archivo.
:fin
echo.
pause

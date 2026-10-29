@echo off
chcp 65001 >nul
title Sistema de estudio - Inteligencia Artificial
cd /d "%~dp0"
echo.
echo   Tu progreso se guarda solo. Para salir, usa el boton "Cerrar la app"
echo   en la pagina o cerra esta ventana con la X.
echo.
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
echo.
pause
exit /b 1
:fin
rem Si el servidor se cerro bien (boton "Cerrar la app"), la ventana se cierra sola.
if %errorlevel%==0 exit /b 0
echo.
echo Algo fallo al abrir la app (mira el mensaje de arriba). Tu progreso guardado no se pierde.
pause

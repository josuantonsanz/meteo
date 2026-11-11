@echo off
rem Publica la web en GitHub (git add + commit + push).
rem Uso:
rem   publicar.bat                    -> mensaje automatico con fecha y hora
rem   publicar.bat "Arreglo del eje" -> mensaje propio
setlocal
cd /d "%~dp0"

where git >nul 2>&1
if errorlevel 1 (
  echo No se encuentra git. Instalalo o anadelo al PATH.
  pause
  exit /b 1
)

set "MSG=%~1"
if "%MSG%"=="" set "MSG=Actualiza la web (%DATE% %TIME:~0,5%)"

echo === Cambios pendientes ===
git status --short

git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "%MSG%"
  if errorlevel 1 goto fallo
) else (
  echo No hay cambios que confirmar; se intentara enviar lo que haya.
)

echo === Enviando a GitHub ===
git push origin main
if errorlevel 1 goto fallo

echo.
echo Listo. GitHub Pages tarda alrededor de un minuto en reconstruir:
echo   https://meteo.glosasdeguardia.es
pause
exit /b 0

:fallo
echo.
echo Ha fallado el envio. Revisa el mensaje de arriba.
pause
exit /b 1

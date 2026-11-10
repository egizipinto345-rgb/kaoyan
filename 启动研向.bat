@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  研向 · 考研方向智能体
echo  正在启动本地预览...
echo.
where py >nul 2>nul
if %errorlevel%==0 (
  start "研向本地服务" /min py -3 -m http.server 5173
) else (
  start "研向本地服务" /min python -m http.server 5173
)
timeout /t 2 >nul
start "" "http://127.0.0.1:5173"
echo  已打开浏览器。
echo  如果页面没有自动打开，请访问：http://127.0.0.1:5173
pause

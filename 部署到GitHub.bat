@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  研向 · 推送到 GitHub
echo  目标仓库：https://github.com/egizipinto345-rgb/kaoyan
echo.
git config user.name "egizipinto345-rgb"
git config user.email "egizipinto345-rgb@users.noreply.github.com"
git remote remove origin 2>nul
git remote add origin https://github.com/egizipinto345-rgb/kaoyan.git
git add -A
git commit -m "deploy complete yanxiang site" 2>nul
git branch -M main
echo.
echo  即将推送。若弹出 GitHub 登录窗口，请登录 egizipinto345-rgb 账号。
echo.
git push -u origin main --force
echo.
echo  推送结束后，回到 GitHub：
echo  Settings - Pages - Deploy from a branch - main - / (root) - Save
echo.
pause

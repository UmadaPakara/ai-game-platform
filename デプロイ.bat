@echo off
cd /d "%~dp0"
echo ========================================
echo  AI Game Platform - Vercelにデプロイ
echo ========================================
echo.
set /p MSG="コミットメッセージを入力してください: "
if "%MSG%"=="" set MSG=update
git add -A
git commit -m "%MSG%"
git push origin main
echo.
echo ✅ デプロイ完了！
echo 🌐 https://ai-game-platform-chi.vercel.app/
echo.
echo (このウィンドウは自動で閉じます)
timeout /t 5

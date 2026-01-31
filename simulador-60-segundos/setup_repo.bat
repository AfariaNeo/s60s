@echo off
echo Configurando Repositorio Git...

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Git nao encontrado! Por favor instale o Git antes de rodar este script.
    echo Baixe em: https://git-scm.com/download/win
    pause
    exit /b
)

echo Inicializando git...
git init
git add .
git commit -m "Initial Commit - Simulador 60 Segundos"
git branch -M main

echo.
echo Repositorio criado com sucesso!
echo Agora voce pode adicionar o repositorio remoto:
echo git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
echo git push -u origin main
echo.
pause

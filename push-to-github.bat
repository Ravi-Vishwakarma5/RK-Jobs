@echo off
echo Pushing code to GitHub...

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed or not in your PATH. Please install Git and try again.
    exit /b 1
)

REM Check if .git directory exists
if not exist .git (
    echo Initializing Git repository...
    git init
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to initialize Git repository.
        exit /b 1
    )
)

REM Add all files to Git
echo Adding files to Git...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo Failed to add files to Git.
    exit /b 1
)

REM Commit changes
echo Committing changes...
git commit -m "Added JWT token authentication and saved jobs functionality"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to commit changes.
    exit /b 1
)

REM Check if remote origin exists
git remote -v | findstr origin >nul
if %ERRORLEVEL% NEQ 0 (
    echo Remote origin not found. Please enter the GitHub repository URL:
    set /p REPO_URL=
    git remote add origin %REPO_URL%
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to add remote origin.
        exit /b 1
    )
)

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin master
if %ERRORLEVEL% NEQ 0 (
    echo Failed to push to GitHub. Trying main branch...
    git push -u origin main
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to push to GitHub. Please check your credentials and try again.
        exit /b 1
    )
)

echo Successfully pushed to GitHub!
pause

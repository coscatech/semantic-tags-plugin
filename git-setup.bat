@echo off
echo 🚀 Setting up Git repository for COSCA Semantic Tagging Extension
echo ================================================================

echo.
echo 1. Initializing Git repository...
git init

echo.
echo 2. Adding remote origin...
git remote add origin https://github.com/coscatech/semantic-tagging-vscode.git

echo.
echo 3. Adding all files...
git add .

echo.
echo 4. Creating initial commit...
git commit -m "Initial release: COSCA Semantic Tagging VSCode Extension

Features:
- Infrastructure pattern detection (IaC, cloud, containers, etc.)
- Purpose-driven metadata tagging (purpose, expiry, owner)
- COSCA readiness scoring
- PostHog telemetry integration
- Visual semantic highlighting
- Insights dashboard

Ready for VSCode Marketplace publication."

echo.
echo 5. Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Repository setup complete!
echo.
echo Next steps:
echo 1. Create GitHub repository: https://github.com/new
echo 2. Repository name: semantic-tagging-vscode
echo 3. Description: VSCode extension for semantic code tagging and infrastructure intent detection
echo 4. Make it public for open source
echo 5. Run this script to push code

pause
Write-Host "🚀 Setting up Git repository for COSCA Semantic Tagging Extension" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

Write-Host ""
Write-Host "1. Initializing Git repository..." -ForegroundColor Yellow
git init

Write-Host ""
Write-Host "2. Adding remote origin..." -ForegroundColor Yellow
git remote add origin https://github.com/coscatech/semantic-tagging-vscode.git

Write-Host ""
Write-Host "3. Adding all files..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "4. Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial release: COSCA Semantic Tagging VSCode Extension

Features:
- Infrastructure pattern detection (IaC, cloud, containers, etc.)
- Purpose-driven metadata tagging (purpose, expiry, owner)
- COSCA readiness scoring
- PostHog telemetry integration
- Visual semantic highlighting
- Insights dashboard

Ready for VSCode Marketplace publication."

Write-Host ""
Write-Host "5. Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "✅ Repository setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repository: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: semantic-tagging-vscode" -ForegroundColor White
Write-Host "3. Description: VSCode extension for semantic code tagging and infrastructure intent detection" -ForegroundColor White
Write-Host "4. Make it public for open source" -ForegroundColor White
Write-Host "5. Run this script to push code" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
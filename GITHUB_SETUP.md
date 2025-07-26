# GitHub Setup Instructions

## 📋 Prerequisites

1. **Install Git**: Download from https://git-scm.com/downloads
2. **GitHub Account**: Sign up at https://github.com if you don't have one
3. **Restart terminal** after installing Git

## 🚀 Quick Setup

### 1. Create GitHub Repository
1. Go to https://github.com/new
2. **Repository name**: `semantic-tagging-vscode`
3. **Description**: `VSCode extension for semantic code tagging and infrastructure intent detection`
4. **Visibility**: Public (for open source)
5. **Don't initialize** with README, .gitignore, or license (we have them)
6. Click "Create repository"

### 2. Push Code to GitHub

#### Option A: Run Setup Script (Windows)
```bash
# PowerShell
.\git-setup.ps1

# Command Prompt  
git-setup.bat
```

#### Option B: Manual Commands
```bash
# Initialize repository
git init

# Add remote origin (replace with your GitHub username if different)
git remote add origin https://github.com/coscatech/semantic-tagging-vscode.git

# Add all files
git add .

# Create initial commit
git commit -m "Initial release: COSCA Semantic Tagging VSCode Extension

Features:
- Infrastructure pattern detection (IaC, cloud, containers, etc.)
- Purpose-driven metadata tagging (purpose, expiry, owner)
- COSCA readiness scoring
- PostHog telemetry integration
- Visual semantic highlighting
- Insights dashboard

Ready for VSCode Marketplace publication."

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔧 Repository Configuration

### Branch Protection (Recommended)
1. Go to repository Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

### Secrets for CI/CD
1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `VSCE_PAT`: VSCode Marketplace Personal Access Token (for publishing)

### Topics/Tags
Add these topics to your repository for discoverability:
- `vscode-extension`
- `semantic-analysis`
- `infrastructure`
- `cosca`
- `purpose-driven`
- `typescript`
- `posthog`

## 📦 Release Process

### Creating a Release
1. Go to repository → Releases → "Create a new release"
2. **Tag version**: `v0.1.0`
3. **Release title**: `v0.1.0 - Initial Release`
4. **Description**: Copy from CHANGELOG.md
5. **Attach binary**: Upload the `.vsix` file
6. Click "Publish release"

### Automatic Publishing
The GitHub Actions workflow will:
- ✅ Run tests on multiple Node.js versions
- ✅ Build and package the extension
- ✅ Publish to VSCode Marketplace (on release)
- ✅ Upload artifacts

## 🌟 Post-Setup Tasks

### 1. Update Repository Links
If using different GitHub username, update these files:
- `package.json` → repository URL
- `README.md` → GitHub links
- `.github/workflows/ci.yml` → if needed

### 2. Enable GitHub Pages (Optional)
1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `docs` folder
4. Create documentation site

### 3. Set Up Issue Templates
Create `.github/ISSUE_TEMPLATE/` with:
- Bug report template
- Feature request template
- Question template

## 🔍 Verification

After pushing, verify:
- ✅ Repository appears on GitHub
- ✅ All files are present
- ✅ README displays correctly
- ✅ GitHub Actions workflow runs
- ✅ Package builds successfully

## 🎯 Next Steps

1. **Test the extension** in VSCode/Cursor
2. **Create first release** with the `.vsix` file
3. **Submit to VSCode Marketplace**
4. **Share with COSCA community**
5. **Gather feedback** and iterate

## 🆘 Troubleshooting

### Git not recognized
- Install Git from https://git-scm.com/downloads
- Restart terminal/PowerShell
- Verify: `git --version`

### Permission denied (publickey)
- Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Or use HTTPS with personal access token

### Repository already exists
- Use different repository name
- Or delete existing repository and recreate

---

**Ready to ship your COSCA Semantic Tagging extension! 🚀**
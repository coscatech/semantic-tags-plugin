# COSCA Semantic Tagging for VSCode

🏗️ **Understand your code's infrastructure intent through semantic reflection**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/coscatech/semantic-tags-plugin)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![COSCA](https://img.shields.io/badge/COSCA-Purpose--Driven%20Infrastructure-purple.svg)](https://github.com/coscatech)

Semantic Tagging is a VSCode extension that reveals the deeper meaning behind your infrastructure code. Rather than just detecting patterns, it reflects on the intent - transforming technical constructs into insights about purpose, responsibility, and architectural thinking.

## 🎯 What Makes This Different

Unlike generic code analysis tools, Semantic Tagging focuses on **infrastructure intent**:
- Detects Infrastructure as Code patterns
- Identifies cloud service usage
- Tracks resource lifecycle metadata
- Calculates COSCA readiness scores
- Connects code patterns to infrastructure purpose

## 🏗️ Infrastructure Patterns Detected

### **Infrastructure as Code**
- `terraform`, `pulumi`, `cloudformation`, `aws_`, `azure_`, `gcp_`

### **Cloud Services** 
- `s3`, `ec2`, `lambda`, `rds`, `dynamodb`, `ecs`, `eks`

### **Container/Orchestration**
- `docker`, `kubernetes`, `k8s`, `pod`, `deployment`, `service`

### **Compute Resources**
- `cpu`, `memory`, `gpu`, `instance`, `cluster`, `scale`

### **Storage Operations**
- `bucket`, `volume`, `disk`, `storage`, `backup`, `snapshot`

### **Purpose-Driven Metadata** (COSCA-specific)
- `purpose: "web_server"` - Why does this resource exist?
- `expiry: "30_days"` - When should it be retired?
- `owner: "platform_team"` - Who's responsible?

## 🚀 Features

- **🔍 Visual Highlighting**: Infrastructure patterns highlighted in your editor
- **📊 COSCA Readiness Score**: Measures how purpose-driven your infrastructure is
- **📈 Insights Dashboard**: View infrastructure patterns and metadata coverage
- **📡 Privacy-First Telemetry**: Optional, anonymous analytics via PostHog
- **🎯 Purpose Detection**: Identifies resource intent and lifecycle metadata

## 📦 Installation

### From VSCode Marketplace (Coming Soon)
1. Open VSCode
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search "COSCA Semantic Tagging"
4. Click Install

### From Release
1. Download `.vsix` file from [Releases](https://github.com/coscatech/semantic-tags-plugin/releases)
2. Run: `code --install-extension semantic-tagging-vscode-0.1.0.vsix`

### Development
```bash
git clone https://github.com/coscatech/semantic-tagging-vscode.git
cd semantic-tagging-vscode
npm install
npm run compile
# Press F5 in VSCode to test
```

## 🎮 Usage

### Commands
- `Semantic Tagging: Scan Current File` - Analyze current file
- `Semantic Tagging: Show Semantic Insights` - View dashboard

### Supported Files
- **Terraform**: `.tf` files
- **Kubernetes**: `.yaml`, `.yml` manifests  
- **Docker**: `docker-compose.yml`, `Dockerfile`
- **Code**: `.js`, `.ts`, `.py`, `.go` with infrastructure patterns

### Example: Terraform File
```hcl
resource "aws_s3_bucket" "data_lake" {
  bucket = "company-data-lake"
  
  tags = {
    purpose = "analytics_storage"    # 🎯 Purpose tag detected
    expiry = "2_years"              # ⏰ Expiry tag detected  
    owner = "data_team"             # 👤 Owner tag detected
  }
}
```

**Result**: High COSCA readiness score with clear resource purpose!

## 📊 COSCA Readiness Score

The extension calculates how "COSCA-ready" your infrastructure is:

- **Infrastructure Patterns**: Detects IaC, cloud services, containers
- **Purpose Metadata**: Finds purpose, expiry, owner tags
- **Lifecycle Awareness**: Identifies resource management patterns

**Score = (Infrastructure Tags + Purpose Metadata) / Total Tags × 100**

## 🔧 Configuration

```json
{
  "semanticTagging.enableTelemetry": false,                    // Enable anonymous analytics
  "semanticTagging.telemetryHost": "https://app.posthog.com",  // PostHog host (use your self-hosted instance)
  "semanticTagging.telemetryApiKey": ""                        // Custom API key for self-hosted PostHog
}
```

### 🏢 Self-Hosted PostHog for Teams
Enterprise teams can run their own PostHog instance for complete data control:
- **Data Sovereignty**: Keep telemetry within your infrastructure
- **Compliance**: Meet GDPR, HIPAA, SOC2 requirements
- **Custom Analytics**: Build team-specific dashboards

See [SELF_HOSTED_TELEMETRY.md](SELF_HOSTED_TELEMETRY.md) for setup instructions.

## 📊 Transparent Telemetry: "We Track Tag Types, Not Code"

### 🔍 What We Actually Collect (When You Opt-In)
```json
{
  "language": "terraform",           // File type only
  "total_tags": 8,                  // Count of patterns found
  "tag_counts": {                   // Pattern categories & counts
    "iac": 3, "purpose": 2, "cloud": 3
  },
  "session_id": "session_abc123"    // Random identifier
}
```

### ❌ What We NEVER Collect
- **Your actual code** - We only count pattern types
- **File names or paths** - No identification of your files
- **Resource names** - We see `purpose = "something"` as just "purpose tag found"
- **Personal info** - No names, emails, or company data
- **Location data** - No IP addresses or geographic info

### 🎯 Why This Helps COSCA
- **Improve pattern detection** - Learn which infrastructure patterns are most common
- **Enhance COSCA readiness** - Understand how teams adopt purpose-driven infrastructure
- **Build better tools** - Focus development on the most-used semantic patterns

**Telemetry is opt-in only** and can be disabled anytime in VSCode settings.

## 🏢 About COSCA

COSCA (Cognitive Orchestration for Compute, Storage, and Analytics) is building the future of purpose-driven infrastructure. This extension is the first step in creating infrastructure that knows why it exists and when it should stop.

**Vision**: Infrastructure that understands business intent, tracks resource purpose, and automates intelligent lifecycle decisions.

## 🤝 Contributing

We welcome contributions! This project is part of COSCA's open source initiative.

### Development Setup
```bash
git clone https://github.com/coscatech/semantic-tagging-vscode.git
cd semantic-tagging-vscode
npm install
npm run compile
```

### Testing
```bash
node test-extension.js  # Run automated tests
# Press F5 in VSCode for manual testing
```

### Areas for Contribution
- 🔍 New infrastructure pattern detection
- 🎨 UI/UX improvements
- 📊 Enhanced analytics and insights
- 🌐 Multi-language support
- 📚 Documentation and examples

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [coscatech/semantic-tags-plugin](https://github.com/coscatech/semantic-tags-plugin)
- **Issues**: [Report bugs or request features](https://github.com/coscatech/semantic-tags-plugin/issues)
- **COSCA**: [Learn more about purpose-driven infrastructure](https://github.com/coscatech)

---

**Built with ❤️ by the COSCA team**

*Making infrastructure smarter, one semantic tag at a time.*
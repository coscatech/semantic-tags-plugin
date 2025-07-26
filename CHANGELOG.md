# Changelog

All notable changes to the COSCA Semantic Tagging extension will be documented in this file.

## [0.1.0] - 2025-01-26

### 🎉 Initial Release

#### Added
- **Infrastructure Pattern Detection**
  - Infrastructure as Code patterns (Terraform, Pulumi, CloudFormation)
  - Cloud service detection (AWS, Azure, GCP services)
  - Container/Kubernetes patterns
  - Compute resource identification
  - Storage operation detection
  - ML infrastructure patterns

- **Purpose-Driven Metadata**
  - Resource purpose detection (`purpose: "web_server"`)
  - Expiry date tracking (`expiry: "30_days"`)
  - Owner identification (`owner: "platform_team"`)

- **Visual Features**
  - Semantic highlighting in editor
  - Hover tooltips for tag information
  - Real-time pattern detection

- **Analytics & Insights**
  - COSCA Readiness Score calculation
  - Infrastructure pattern dashboard
  - Purpose metadata coverage metrics
  - Interactive insights webview

- **Telemetry Integration**
  - PostHog analytics integration
  - Privacy-first, opt-in telemetry
  - Infrastructure-specific metrics
  - Anonymous usage tracking

- **Developer Experience**
  - Command palette integration
  - Auto-scan on file open/save
  - Support for multiple file types
  - Comprehensive test suite

#### Supported File Types
- Terraform (`.tf`)
- Kubernetes YAML (`.yaml`, `.yml`)
- Docker Compose (`docker-compose.yml`)
- JavaScript/TypeScript (`.js`, `.ts`)
- Python (`.py`)
- General code files with infrastructure patterns

#### Commands
- `Semantic Tagging: Scan Current File`
- `Semantic Tagging: Show Semantic Insights`

#### Configuration
- `semanticTagging.enableTelemetry` - Enable/disable anonymous telemetry

### 🎯 COSCA Integration
This release establishes the foundation for COSCA's purpose-driven infrastructure vision by:
- Detecting infrastructure intent at the code level
- Tracking resource lifecycle metadata
- Measuring infrastructure semantic maturity
- Creating data pipeline for infrastructure intelligence

### 📊 Metrics
- **Pattern Types**: 11 infrastructure categories
- **Test Coverage**: 44 automated tests
- **Performance**: <1ms pattern matching
- **Package Size**: ~563KB

---

## Upcoming Features (Roadmap)

### [0.2.0] - Planned
- AST-level semantic analysis
- Custom pattern definitions
- Team-level insights aggregation
- Git integration for change tracking

### [0.3.0] - Planned
- Multi-cloud provider detection
- Cost estimation integration
- Compliance pattern detection
- Advanced ML infrastructure patterns

### [1.0.0] - Planned
- Full COSCA platform integration
- Automated resource lifecycle suggestions
- Enterprise team features
- Advanced analytics dashboard
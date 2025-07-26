# @cosca/semantic-tags

🏗️ **Semantic code analysis for infrastructure patterns and purpose-driven metadata**

[![npm version](https://badge.fury.io/js/@cosca%2Fsemantic-tags.svg)](https://www.npmjs.com/package/@cosca/semantic-tags)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript/JavaScript library for analyzing code and detecting infrastructure patterns, purpose-driven metadata, and semantic tags. Built by [COSCA](https://github.com/coscatech) for purpose-driven infrastructure analysis.

## 🚀 Installation

```bash
npm install @cosca/semantic-tags
```

## 📖 Usage

### Basic Analysis

```typescript
import { analyzeCode, SemanticAnalysisResult } from '@cosca/semantic-tags';

const terraformCode = `
resource "aws_s3_bucket" "data_lake" {
  bucket = "company-data-lake"
  
  tags = {
    purpose = "analytics_storage"
    expiry = "2_years"
    owner = "data_team"
  }
}
`;

const result: SemanticAnalysisResult = analyzeCode(terraformCode, 'terraform');

console.log('COSCA Readiness Score:', result.coscaReadinessScore);
console.log('Infrastructure Tags:', result.infraTagCount);
console.log('Has Purpose Metadata:', result.hasPurposeMetadata);
```

### File Analysis

```typescript
import { analyzeFile } from '@cosca/semantic-tags';
import fs from 'fs';

const content = fs.readFileSync('infrastructure.tf', 'utf8');
const result = analyzeFile('infrastructure.tf', content);

console.log('Analysis Results:', {
  totalTags: result.totalTags,
  topPatterns: result.insights.topPatterns,
  isInfrastructure: result.isInfraFile
});
```

### Advanced Usage with Custom Analyzer

```typescript
import { SemanticAnalyzer } from '@cosca/semantic-tags';

const analyzer = new SemanticAnalyzer();
const result = analyzer.analyze(codeContent);

// Access detailed tag information
result.tags.forEach(tag => {
  console.log(`${tag.label} found at line ${tag.line + 1}: "${tag.match}"`);
});
```

## 🏷️ Detected Patterns

### Infrastructure Patterns
- **Infrastructure as Code**: `terraform`, `pulumi`, `cloudformation`
- **Cloud Services**: `s3`, `ec2`, `lambda`, `rds`, `dynamodb`
- **Containers**: `docker`, `kubernetes`, `k8s`, `pod`, `deployment`
- **Compute**: `cpu`, `memory`, `gpu`, `instance`, `cluster`
- **Storage**: `bucket`, `volume`, `disk`, `backup`
- **Observability**: `metrics`, `logs`, `prometheus`, `grafana`

### Purpose-Driven Metadata (COSCA-specific)
- **Purpose**: `purpose = "web_server"`
- **Expiry**: `expiry = "30_days"`
- **Owner**: `owner = "platform_team"`

### General Code Patterns
- **Network**: `fetch`, `axios`, `http.get`
- **Debug**: `console.log`, `print`, `debugger`
- **TODOs**: `TODO`, `FIXME`, `HACK`
- **Database**: `SELECT`, `query`, `findOne`
- **Auth**: `login`, `token`, `jwt`

## 📊 Analysis Results

The `SemanticAnalysisResult` interface provides:

```typescript
interface SemanticAnalysisResult {
  totalTags: number;                    // Total semantic tags found
  tags: SemanticTag[];                  // Detailed tag information
  tagCounts: Record<string, number>;    // Count by tag type
  infraTagCount: number;                // Infrastructure-specific tags
  isInfraFile: boolean;                 // Contains infrastructure patterns
  hasPurposeMetadata: boolean;          // Contains COSCA metadata
  coscaReadinessScore: number;          // 0-100 readiness score
  insights: {
    topPatterns: [string, number][];    // Most common patterns
    purposeTags: number;                // Purpose metadata count
    expiryTags: number;                 // Expiry metadata count
    ownerTags: number;                  // Owner metadata count
  };
}
```

## 🎯 COSCA Readiness Score

The library calculates a "COSCA Readiness Score" (0-100) based on:
- Infrastructure pattern density
- Purpose-driven metadata presence
- Resource lifecycle awareness

**Score = (Infrastructure Tags + Purpose Metadata) / Total Tags × 100**

## 🔧 Supported File Types

- **Terraform**: `.tf` files
- **Kubernetes**: `.yaml`, `.yml` manifests
- **Docker**: `docker-compose.yml`, `Dockerfile`
- **JavaScript/TypeScript**: `.js`, `.ts`
- **Python**: `.py`
- **Go**: `.go`
- **JSON**: `.json`

## 📈 Use Cases

### DevOps & Infrastructure
```typescript
// Analyze Terraform files for infrastructure patterns
const infraAnalysis = analyzeFile('main.tf', terraformContent);
if (infraAnalysis.coscaReadinessScore < 50) {
  console.warn('Low COSCA readiness - consider adding purpose metadata');
}
```

### Code Quality Analysis
```typescript
// Check for debug statements in production code
const codeAnalysis = analyzeCode(sourceCode, 'javascript');
const debugTags = codeAnalysis.tagCounts['debug'] || 0;
if (debugTags > 0) {
  console.warn(`Found ${debugTags} debug statements`);
}
```

### CI/CD Integration
```typescript
// Validate infrastructure files in CI pipeline
import glob from 'glob';

const infraFiles = glob.sync('**/*.tf');
let totalReadinessScore = 0;

infraFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const analysis = analyzeFile(file, content);
  totalReadinessScore += analysis.coscaReadinessScore;
  
  if (!analysis.hasPurposeMetadata) {
    console.error(`${file}: Missing purpose metadata`);
  }
});

const avgReadiness = totalReadinessScore / infraFiles.length;
console.log(`Average COSCA Readiness: ${avgReadiness}%`);
```

## 🤝 Contributing

This library is part of the COSCA ecosystem. Contributions welcome!

```bash
git clone https://github.com/coscatech/semantic-tags-plugin.git
cd semantic-tags-plugin/lib
npm install
npm run build
npm test
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- **[COSCA Semantic Tagging VSCode Extension](https://github.com/coscatech/semantic-tags-plugin)** - VSCode extension using this library
- **[COSCA Platform](https://github.com/coscatech)** - Purpose-driven infrastructure orchestration

---

**Built with ❤️ by the COSCA team**

*Making infrastructure smarter, one semantic tag at a time.*
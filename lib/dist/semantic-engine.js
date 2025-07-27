"use strict";
/**
 * COSCA Semantic Analysis Engine
 * Core infrastructure pattern detection and purpose-driven metadata analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.semanticEngine = exports.analyzeFile = exports.analyzeCode = exports.SemanticEngine = void 0;
class SemanticEngine {
    constructor(customPatterns) {
        this.patterns = customPatterns || this.getDefaultPatterns();
    }
    /**
     * Analyze text content for semantic patterns
     */
    analyze(text, options = {}) {
        const { minConfidence = 0.8 } = options;
        const tags = this.extractTags(text, minConfidence);
        return this.generateAnalysis(tags);
    }
    /**
     * Analyze file content with automatic language detection
     */
    analyzeFile(filePath, content) {
        const languageId = this.detectLanguage(filePath);
        return this.analyze(content, { languageId });
    }
    getDefaultPatterns() {
        return [
            // Infrastructure Intent Patterns
            { pattern: /\b(terraform|pulumi|cloudformation|aws_|azure_|gcp_|resource|provider)\b/gi, type: 'iac', label: 'Infrastructure Declaration', category: 'infrastructure' },
            { pattern: /\b(s3|ec2|lambda|rds|dynamodb|sqs|sns|cloudwatch|ecs|eks|fargate)\b/gi, type: 'cloud', label: 'Cloud Service Intent', category: 'infrastructure' },
            { pattern: /\b(docker|kubernetes|k8s|pod|deployment|service|ingress|helm)\b/gi, type: 'container', label: 'Orchestration Intent', category: 'infrastructure' },
            { pattern: /\b(cpu|memory|gpu|instance|cluster|node|worker|scale)\b/gi, type: 'compute', label: 'Compute Requirement', category: 'infrastructure' },
            { pattern: /\b(bucket|volume|disk|storage|backup|snapshot|archive)\b/gi, type: 'storage', label: 'Data Persistence Intent', category: 'infrastructure' },
            { pattern: /\b(metrics|logs|traces|alert|monitor|dashboard|prometheus|grafana)\b/gi, type: 'observability', label: 'Visibility Intent', category: 'infrastructure' },
            { pattern: /\b(create|destroy|provision|deprovision|scale_up|scale_down|terminate)\b/gi, type: 'lifecycle', label: 'Resource Lifecycle Intent', category: 'infrastructure' },
            { pattern: /\b(cost|billing|budget|pricing|reserved|spot|savings)\b/gi, type: 'cost', label: 'Economic Consideration', category: 'infrastructure' },
            { pattern: /\b(iam|role|policy|security_group|vpc|encryption|compliance)\b/gi, type: 'security', label: 'Security Boundary', category: 'infrastructure' },
            { pattern: /\b(model|training|inference|gpu_cluster|sagemaker|ml_pipeline)\b/gi, type: 'ml_infra', label: 'Intelligence Infrastructure', category: 'infrastructure' },
            // Purpose-Driven Metadata (COSCA-specific)
            { pattern: /purpose\s*[:=]\s*["']([^"']+)["']/gi, type: 'purpose', label: 'Declared Purpose', category: 'purpose' },
            { pattern: /expiry\s*[:=]\s*["']([^"']+)["']/gi, type: 'expiry', label: 'Lifecycle Expectation', category: 'purpose' },
            { pattern: /owner\s*[:=]\s*["']([^"']+)["']/gi, type: 'owner', label: 'Responsibility Assignment', category: 'purpose' },
            // Code Intent Patterns
            { pattern: /\b(fetch|axios|http\.get|http\.post|XMLHttpRequest)\b/gi, type: 'network', label: 'External Communication', category: 'general' },
            { pattern: /\b(console\.log|console\.error|console\.warn|print|println|debugger)\b/gi, type: 'debug', label: 'Development Insight', category: 'general' },
            { pattern: /\b(TODO|FIXME|HACK|XXX|NOTE)\b/gi, type: 'todo', label: 'Future Intention', category: 'general' },
            { pattern: /\b(SELECT|INSERT|UPDATE|DELETE|query|findOne|save|create)\b/gi, type: 'database', label: 'Data Interaction', category: 'general' },
            { pattern: /\b(try|catch|throw|error|exception)\b/gi, type: 'error', label: 'Resilience Pattern', category: 'general' },
            { pattern: /\b(auth|login|logout|token|jwt|session|password)\b/gi, type: 'auth', label: 'Identity Verification', category: 'general' },
            { pattern: /\b(config|env|process\.env|settings|options)\b/gi, type: 'config', label: 'Behavior Configuration', category: 'general' }
        ];
    }
    extractTags(text, minConfidence) {
        const tags = [];
        const lines = text.split('\n');
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            for (const patternConfig of this.patterns) {
                this.findMatches(line, lineIndex, patternConfig, tags, minConfidence);
            }
        }
        return tags;
    }
    findMatches(line, lineNumber, patternConfig, tags, minConfidence) {
        const regex = new RegExp(patternConfig.pattern.source, patternConfig.pattern.flags);
        let match;
        while ((match = regex.exec(line)) !== null) {
            const confidence = 0.8; // Base confidence, could be enhanced
            if (confidence >= minConfidence) {
                tags.push({
                    type: patternConfig.type,
                    label: patternConfig.label,
                    line: lineNumber,
                    column: match.index,
                    length: match[0].length,
                    confidence,
                    match: match[0]
                });
            }
            if (!regex.global)
                break;
        }
    }
    generateAnalysis(tags) {
        const tagCounts = this.calculateTagCounts(tags);
        const infraTags = ['iac', 'cloud', 'container', 'compute', 'storage', 'observability', 'lifecycle', 'cost', 'security', 'ml_infra'];
        const infraTagCount = infraTags.reduce((sum, type) => sum + (tagCounts[type] || 0), 0);
        const isInfraFile = infraTagCount > 0;
        const purposeTags = tagCounts['purpose'] || 0;
        const expiryTags = tagCounts['expiry'] || 0;
        const ownerTags = tagCounts['owner'] || 0;
        const hasPurposeMetadata = purposeTags > 0 || expiryTags > 0 || ownerTags > 0;
        const totalTags = tags.length;
        const coscaReadinessScore = totalTags > 0 ?
            Math.round(((infraTagCount + purposeTags + expiryTags + ownerTags) / totalTags) * 100) : 0;
        const topPatterns = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
        return {
            totalTags,
            tags,
            tagCounts,
            infraTagCount,
            isInfraFile,
            hasPurposeMetadata,
            coscaReadinessScore,
            insights: {
                topPatterns,
                purposeTags,
                expiryTags,
                ownerTags
            }
        };
    }
    calculateTagCounts(tags) {
        return tags.reduce((acc, tag) => {
            acc[tag.type] = (acc[tag.type] || 0) + 1;
            return acc;
        }, {});
    }
    detectLanguage(filePath) {
        const extension = filePath.split('.').pop()?.toLowerCase();
        const languageMap = {
            'tf': 'terraform',
            'yaml': 'yaml',
            'yml': 'yaml',
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'go': 'go',
            'json': 'json',
            'dockerfile': 'dockerfile'
        };
        return languageMap[extension || ''] || 'unknown';
    }
}
exports.SemanticEngine = SemanticEngine;
// Export convenience functions
function analyzeCode(text, options) {
    const engine = new SemanticEngine();
    return engine.analyze(text, options);
}
exports.analyzeCode = analyzeCode;
function analyzeFile(filePath, content) {
    const engine = new SemanticEngine();
    return engine.analyzeFile(filePath, content);
}
exports.analyzeFile = analyzeFile;
// Export default instance
exports.semanticEngine = new SemanticEngine();
//# sourceMappingURL=semantic-engine.js.map
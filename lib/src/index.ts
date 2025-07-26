/**
 * COSCA Semantic Tags - Infrastructure Pattern Analysis
 * 
 * Analyzes code for infrastructure patterns and purpose-driven metadata
 */

export interface SemanticTag {
    type: string;
    label: string;
    line: number;
    column: number;
    length: number;
    confidence: number;
    match: string;
}

export interface SemanticAnalysisResult {
    totalTags: number;
    tags: SemanticTag[];
    tagCounts: Record<string, number>;
    infraTagCount: number;
    isInfraFile: boolean;
    hasPurposeMetadata: boolean;
    coscaReadinessScore: number;
    insights: {
        topPatterns: [string, number][];
        purposeTags: number;
        expiryTags: number;
        ownerTags: number;
    };
}

export class SemanticAnalyzer {
    private patterns: Array<{
        pattern: RegExp;
        type: string;
        label: string;
        category: 'infrastructure' | 'purpose' | 'general';
    }>;

    constructor() {
        this.patterns = [
            // Infrastructure as Code
            { pattern: /\b(terraform|pulumi|cloudformation|aws_|azure_|gcp_|resource|provider)\b/gi, type: 'iac', label: 'Infrastructure as Code', category: 'infrastructure' },
            
            // Cloud Services
            { pattern: /\b(s3|ec2|lambda|rds|dynamodb|sqs|sns|cloudwatch|ecs|eks|fargate)\b/gi, type: 'cloud', label: 'Cloud Service', category: 'infrastructure' },
            
            // Container/Orchestration
            { pattern: /\b(docker|kubernetes|k8s|pod|deployment|service|ingress|helm)\b/gi, type: 'container', label: 'Container/K8s', category: 'infrastructure' },
            
            // Compute Resources
            { pattern: /\b(cpu|memory|gpu|instance|cluster|node|worker|scale)\b/gi, type: 'compute', label: 'Compute Resource', category: 'infrastructure' },
            
            // Storage Operations
            { pattern: /\b(bucket|volume|disk|storage|backup|snapshot|archive)\b/gi, type: 'storage', label: 'Storage Operation', category: 'infrastructure' },
            
            // Observability
            { pattern: /\b(metrics|logs|traces|alert|monitor|dashboard|prometheus|grafana)\b/gi, type: 'observability', label: 'Observability', category: 'infrastructure' },
            
            // Resource Lifecycle
            { pattern: /\b(create|destroy|provision|deprovision|scale_up|scale_down|terminate)\b/gi, type: 'lifecycle', label: 'Resource Lifecycle', category: 'infrastructure' },
            
            // Cost/Billing
            { pattern: /\b(cost|billing|budget|pricing|reserved|spot|savings)\b/gi, type: 'cost', label: 'Cost Management', category: 'infrastructure' },
            
            // Security/Compliance
            { pattern: /\b(iam|role|policy|security_group|vpc|encryption|compliance)\b/gi, type: 'security', label: 'Security/Compliance', category: 'infrastructure' },
            
            // ML/AI Infrastructure
            { pattern: /\b(model|training|inference|gpu_cluster|sagemaker|ml_pipeline)\b/gi, type: 'ml_infra', label: 'ML Infrastructure', category: 'infrastructure' },
            
            // Purpose Tags (COSCA-specific)
            { pattern: /purpose\s*[:=]\s*["']([^"']+)["']/gi, type: 'purpose', label: 'Resource Purpose', category: 'purpose' },
            { pattern: /expiry\s*[:=]\s*["']([^"']+)["']/gi, type: 'expiry', label: 'Resource Expiry', category: 'purpose' },
            { pattern: /owner\s*[:=]\s*["']([^"']+)["']/gi, type: 'owner', label: 'Resource Owner', category: 'purpose' },
            
            // General Code Patterns
            { pattern: /\b(fetch|axios|http\.get|http\.post|XMLHttpRequest)\b/gi, type: 'network', label: 'Network Call', category: 'general' },
            { pattern: /\b(console\.log|console\.error|console\.warn|print|println|debugger)\b/gi, type: 'debug', label: 'Debug Statement', category: 'general' },
            { pattern: /\b(TODO|FIXME|HACK|XXX|NOTE)\b/gi, type: 'todo', label: 'Unfinished Block', category: 'general' },
            { pattern: /\b(SELECT|INSERT|UPDATE|DELETE|query|findOne|save|create)\b/gi, type: 'database', label: 'Database Operation', category: 'general' },
            { pattern: /\b(try|catch|throw|error|exception)\b/gi, type: 'error', label: 'Error Handling', category: 'general' },
            { pattern: /\b(auth|login|logout|token|jwt|session|password)\b/gi, type: 'auth', label: 'Authentication', category: 'general' },
            { pattern: /\b(config|env|process\.env|settings|options)\b/gi, type: 'config', label: 'Configuration', category: 'general' }
        ];
    }

    /**
     * Analyze text content for semantic patterns
     */
    analyze(text: string, languageId?: string): SemanticAnalysisResult {
        const tags = this.extractSemanticTags(text);
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
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5) as [string, number][];

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

    /**
     * Analyze a file by path
     */
    analyzeFile(filePath: string, content: string): SemanticAnalysisResult {
        const extension = filePath.split('.').pop()?.toLowerCase();
        const languageId = this.getLanguageId(extension);
        return this.analyze(content, languageId);
    }

    /**
     * Get language ID from file extension
     */
    private getLanguageId(extension?: string): string {
        const languageMap: Record<string, string> = {
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

    private extractSemanticTags(text: string): SemanticTag[] {
        const tags: SemanticTag[] = [];
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            
            for (const patternConfig of this.patterns) {
                this.findPattern(line, lineIndex, patternConfig.pattern, patternConfig.type, patternConfig.label, tags);
            }
        }

        return tags;
    }

    private findPattern(line: string, lineNumber: number, pattern: RegExp, type: string, label: string, tags: SemanticTag[]): void {
        // Reset regex lastIndex to ensure consistent matching
        pattern.lastIndex = 0;
        
        let match;
        while ((match = pattern.exec(line)) !== null) {
            tags.push({
                type,
                label,
                line: lineNumber,
                column: match.index,
                length: match[0].length,
                confidence: 0.8,
                match: match[0]
            });
            
            // Prevent infinite loop for global regexes
            if (!pattern.global) break;
        }
    }

    private calculateTagCounts(tags: SemanticTag[]): Record<string, number> {
        return tags.reduce((acc, tag) => {
            acc[tag.type] = (acc[tag.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }
}

// Export default instance for convenience
export const semanticAnalyzer = new SemanticAnalyzer();

// Export utility functions
export function analyzeCode(text: string, languageId?: string): SemanticAnalysisResult {
    return semanticAnalyzer.analyze(text, languageId);
}

export function analyzeFile(filePath: string, content: string): SemanticAnalysisResult {
    return semanticAnalyzer.analyzeFile(filePath, content);
}
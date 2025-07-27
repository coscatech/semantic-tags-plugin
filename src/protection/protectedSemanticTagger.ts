import * as vscode from 'vscode';
import { TelemetryService } from '../telemetry';
import { configManager, ExtensionConfig } from '../config';
import { LRUCache } from '../utils/lruCache';
import { ErrorClassifier } from '../utils/errorHandling';
import { encryptionService } from './encryptionService';
import { PatternObfuscator, RuntimeProtection, ObfuscatedPattern } from './obfuscator';

export interface SemanticTag {
    type: string;
    label: string;
    line: number;
    column: number;
    length: number;
    confidence: number;
}

interface CompiledPattern {
    regex: RegExp;
    type: string;
    label: string;
}

export class ProtectedSemanticTagger {
    private cache: LRUCache<string, SemanticTag[]>;
    private decorationType: vscode.TextEditorDecorationType;
    private config: ExtensionConfig;
    private encryptedPatterns: ObfuscatedPattern[];
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
    private disposables: vscode.Disposable[] = [];
    private sessionToken: string;

    constructor(private telemetryService: TelemetryService) {
        this.sessionToken = encryptionService.generateSecureToken();
        this.config = configManager.getConfig();
        this.cache = new LRUCache({
            maxSize: this.config.analysis.maxCacheSize,
            ttl: this.config.analysis.cacheTTL
        });
        
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            border: '1px solid rgba(255, 193, 7, 0.5)',
            borderRadius: '3px'
        });

        this.encryptedPatterns = this.initializeProtectedPatterns();
        this.setupConfigListener();
    }

    private initializeProtectedPatterns(): ObfuscatedPattern[] {
        // The core IP - semantic patterns are now encrypted
        const rawPatterns = [
            // External Communication Intent
            { regex: /\b(fetch|axios|http\.get|http\.post|XMLHttpRequest)\b/gi, type: 'network', label: 'External Communication' },
            
            // Development Insights
            { regex: /\b(console\.log|console\.error|console\.warn|print|println|debugger)\b/gi, type: 'debug', label: 'Development Insight' },
            
            // Future Intentions
            { regex: /\b(TODO|FIXME|HACK|XXX|NOTE)\b/gi, type: 'todo', label: 'Future Intention' },
            
            // Data Interactions
            { regex: /\b(SELECT|INSERT|UPDATE|DELETE|query|findOne|save|create)\b/gi, type: 'database', label: 'Data Interaction' },
            
            // Resilience Patterns
            { regex: /\b(try|catch|throw|error|exception)\b/gi, type: 'error', label: 'Resilience Pattern' },
            
            // Identity Verification
            { regex: /\b(auth|login|logout|token|jwt|session|password)\b/gi, type: 'auth', label: 'Identity Verification' },
            
            // Behavior Configuration
            { regex: /\b(config|env|process\.env|settings|options)\b/gi, type: 'config', label: 'Behavior Configuration' },
            
            // Infrastructure Declaration
            { regex: /\b(terraform|pulumi|cloudformation|aws_|azure_|gcp_|resource|provider)\b/gi, type: 'iac', label: 'Infrastructure Declaration' },
            
            // Cloud Service Intent
            { regex: /\b(s3|ec2|lambda|rds|dynamodb|sqs|sns|cloudwatch|ecs|eks|fargate)\b/gi, type: 'cloud', label: 'Cloud Service Intent' },
            
            // Orchestration Intent
            { regex: /\b(docker|kubernetes|k8s|pod|deployment|service|ingress|helm)\b/gi, type: 'container', label: 'Orchestration Intent' },
            
            // Compute Requirements
            { regex: /\b(cpu|memory|gpu|instance|cluster|node|worker|scale)\b/gi, type: 'compute', label: 'Compute Requirement' },
            
            // Data Persistence Intent
            { regex: /\b(bucket|volume|disk|storage|backup|snapshot|archive)\b/gi, type: 'storage', label: 'Data Persistence Intent' },
            
            // Visibility Intent
            { regex: /\b(metrics|logs|traces|alert|monitor|dashboard|prometheus|grafana)\b/gi, type: 'observability', label: 'Visibility Intent' },
            
            // Resource Lifecycle Intent
            { regex: /\b(create|destroy|provision|deprovision|scale_up|scale_down|terminate)\b/gi, type: 'lifecycle', label: 'Resource Lifecycle Intent' },
            
            // Economic Considerations
            { regex: /\b(cost|billing|budget|pricing|reserved|spot|savings)\b/gi, type: 'cost', label: 'Economic Consideration' },
            
            // Security Boundaries
            { regex: /\b(iam|role|policy|security_group|vpc|encryption|compliance)\b/gi, type: 'security', label: 'Security Boundary' },
            
            // Intelligence Infrastructure
            { regex: /\b(model|training|inference|gpu_cluster|sagemaker|ml_pipeline)\b/gi, type: 'ml_infra', label: 'Intelligence Infrastructure' },
            
            // Purpose-Driven Metadata (COSCA-specific)
            { regex: /purpose\s*[:=]\s*["']([^"']+)["']/gi, type: 'purpose', label: 'Declared Purpose' },
            { regex: /expiry\s*[:=]\s*["']([^"']+)["']/gi, type: 'expiry', label: 'Lifecycle Expectation' },
            { regex: /owner\s*[:=]\s*["']([^"']+)["']/gi, type: 'owner', label: 'Responsibility Assignment' }
        ];

        // Encrypt and obfuscate the patterns
        return PatternObfuscator.obfuscatePatterns(rawPatterns);
    }

    private setupConfigListener(): void {
        const disposable = vscode.commands.registerCommand('semanticTagging.configChanged', (newConfig: ExtensionConfig) => {
            this.config = newConfig;
            this.cache.clear(); // Clear cache when config changes
        });
        this.disposables.push(disposable);
    }

    private getCompiledPatterns(): CompiledPattern[] {
        try {
            // Decrypt patterns at runtime
            const decryptedPatterns = PatternObfuscator.deobfuscatePatterns(this.encryptedPatterns);
            
            return decryptedPatterns.map(pattern => ({
                regex: new RegExp(pattern.regex.source, pattern.regex.flags),
                type: pattern.type,
                label: pattern.label
            }));
        } catch (error) {
            console.error('Failed to decrypt semantic patterns:', error);
            // Return minimal fallback patterns
            return [
                { regex: /\b(TODO|FIXME)\b/gi, type: 'todo', label: 'Future Intention' }
            ];
        }
    }

    scanDocument = RuntimeProtection.wrapFunction(
        (document: vscode.TextDocument): void => {
            const documentUri = document.uri.toString();
            
            // Validate input
            if (!RuntimeProtection.validateInput(documentUri, {})) {
                console.warn('Invalid document URI detected');
                return;
            }
            
            // Clear existing debounce timer
            const existingTimer = this.debounceTimers.get(documentUri);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }

            // Debounce the scan operation
            const timer = setTimeout(() => {
                this.performScan(document);
                this.debounceTimers.delete(documentUri);
            }, this.config.analysis.debounceDelay);

            this.debounceTimers.set(documentUri, timer);
        },
        'scanDocument'
    );

    private performScan = RuntimeProtection.wrapFunction(
        async (document: vscode.TextDocument): Promise<void> => {
            try {
                const documentUri = document.uri.toString();
                const text = document.getText();

                // Input validation
                if (!text || text.length === 0) {
                    return;
                }

                if (text.length > this.config.analysis.maxFileSize) {
                    console.warn(`File too large for semantic analysis: ${text.length} bytes`);
                    return;
                }

                // Check cache first
                const cacheKey = this.generateSecureCacheKey(documentUri, text);
                let tags = this.cache.get(cacheKey);

                if (!tags) {
                    // Perform protected analysis
                    tags = await this.extractSemanticTagsProtected(text, document.languageId);
                    
                    // Cache the results
                    this.cache.set(cacheKey, tags);
                }

                this.updateDecorations(document, tags);
                
                // Send telemetry (async, don't wait) - but sanitize first
                const sanitizedTags = this.sanitizeTagsForTelemetry(tags);
                this.telemetryService.trackScan(document.languageId, sanitizedTags).catch(error => {
                    console.warn('Failed to send telemetry:', error);
                });

            } catch (error) {
                const classifiedError = ErrorClassifier.classify(error);
                console.error('Failed to perform semantic scan:', classifiedError.message);
            }
        },
        'performScan'
    );

    private generateSecureCacheKey(uri: string, text: string): string {
        // Create a secure hash-based key
        const combined = `${this.sessionToken}:${uri}:${text}`;
        return encryptionService.hashData(combined);
    }

    private extractSemanticTagsProtected = RuntimeProtection.wrapFunction(
        async (text: string, languageId: string): Promise<SemanticTag[]> => {
            const tags: SemanticTag[] = [];
            const lines = text.split('\n');

            // Get decrypted patterns
            const compiledPatterns = this.getCompiledPatterns();

            // Use compiled patterns for analysis
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                for (const pattern of compiledPatterns) {
                    this.findPatternOptimized(line, i, pattern, tags);
                }
            }

            return tags;
        },
        'extractSemanticTagsProtected'
    );

    private findPatternOptimized(line: string, lineNumber: number, pattern: CompiledPattern, tags: SemanticTag[]): void {
        // Reset regex lastIndex to ensure consistent matching
        pattern.regex.lastIndex = 0;
        
        let match;
        while ((match = pattern.regex.exec(line)) !== null) {
            tags.push({
                type: pattern.type,
                label: pattern.label,
                line: lineNumber,
                column: match.index,
                length: match[0].length,
                confidence: this.config.analysis.confidenceThreshold
            });
            
            // Prevent infinite loop for global regexes
            if (!pattern.regex.global) {
                break;
            }
        }
    }

    private sanitizeTagsForTelemetry(tags: SemanticTag[]): SemanticTag[] {
        // Remove sensitive information before sending telemetry
        return tags.map(tag => ({
            type: tag.type,
            label: tag.label,
            line: -1, // Don't send exact line numbers
            column: -1, // Don't send exact column positions
            length: Math.min(tag.length, 50), // Limit length information
            confidence: Math.round(tag.confidence * 10) / 10 // Round confidence
        }));
    }

    private updateDecorations(document: vscode.TextDocument, tags: SemanticTag[]): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return;
        }

        try {
            const decorations: vscode.DecorationOptions[] = tags.map(tag => ({
                range: new vscode.Range(
                    Math.max(0, tag.line),
                    Math.max(0, tag.column),
                    Math.max(0, tag.line),
                    Math.max(0, tag.column + tag.length)
                ),
                hoverMessage: `**${tag.label}** (${tag.type}) - Confidence: ${Math.round(tag.confidence * 100)}%`
            }));

            editor.setDecorations(this.decorationType, decorations);
        } catch (error) {
            console.error('Failed to update decorations:', error);
        }
    }

    showInsights(): void {
        const panel = vscode.window.createWebviewPanel(
            'semanticInsights',
            'Semantic Insights',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        const insights = this.generateInsights();
        panel.webview.html = this.getWebviewContent(insights);
    }

    private generateInsights(): any {
        // Get all cached tags (sanitized)
        const allTags: SemanticTag[] = [];
        const cacheKeys = this.cache.keys();
        
        for (const key of cacheKeys) {
            const tags = this.cache.get(key);
            if (tags) {
                // Sanitize tags before including in insights
                allTags.push(...this.sanitizeTagsForTelemetry(tags));
            }
        }

        const tagCounts = allTags.reduce((acc, tag) => {
            acc[tag.type] = (acc[tag.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalTags: allTags.length,
            tagCounts,
            topPatterns: Object.entries(tagCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5),
            cacheStats: {
                size: this.cache.size(),
                maxSize: this.config.analysis.maxCacheSize
            }
        };
    }

    dispose(): void {
        // Clear all debounce timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();

        // Clear cache
        this.cache.clear();

        // Dispose of decorations
        this.decorationType.dispose();

        // Dispose of VSCode disposables
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];

        // Clear encrypted patterns from memory
        this.encryptedPatterns = [];
    }

    private getWebviewContent(insights: any): string {
        const infraTags = ['iac', 'cloud', 'container', 'compute', 'storage', 'observability', 'lifecycle', 'cost', 'security', 'ml_infra'];
        const infraTagCount = infraTags.reduce((sum, type) => sum + (insights.tagCounts[type] || 0), 0);
        const purposeTags = insights.tagCounts['purpose'] || 0;
        const expiryTags = insights.tagCounts['expiry'] || 0;
        const ownerTags = insights.tagCounts['owner'] || 0;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
                .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .infra-metric { background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #2196f3; }
                .purpose-metric { background: #f3e5f5; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #9c27b0; }
                .chart { margin: 20px 0; }
                .bar { background: #007acc; height: 20px; margin: 5px 0; border-radius: 3px; }
                .infra-bar { background: #2196f3; height: 20px; margin: 5px 0; border-radius: 3px; }
                .purpose-bar { background: #9c27b0; height: 20px; margin: 5px 0; border-radius: 3px; }
                .section { margin: 30px 0; }
                h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                .protected { background: #e8f5e8; border: 1px solid #4caf50; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>🧠 Semantic Reflection - COSCA Edition (Protected)</h1>
            
            <div class="protected">
                <strong>🔒 IP Protected:</strong> This analysis uses encrypted semantic patterns to protect intellectual property.
            </div>
            
            <div class="section">
                <h2>💭 Intent Overview</h2>
                <div class="metric">
                    <h3>Semantic Insights Discovered: ${insights.totalTags}</h3>
                    <p>Reflecting on the deeper meaning behind your code patterns</p>
                </div>
            </div>

            <div class="section">
                <h2>🏗️ Infrastructure Intent</h2>
                <div class="infra-metric">
                    <h3>Infrastructure Intentions: ${infraTagCount}</h3>
                    <p>${infraTagCount > 0 ? '✅ Your code expresses clear infrastructure intent' : '💭 Consider adding infrastructure declarations'}</p>
                </div>
                
                ${infraTagCount > 0 ? `
                <div class="chart">
                    <h3>Infrastructure Thinking Patterns</h3>
                    ${infraTags.filter(type => insights.tagCounts[type] > 0).map(type => `
                        <div>
                            <strong>${type}</strong>: ${insights.tagCounts[type]} reflections
                            <div class="infra-bar" style="width: ${(insights.tagCounts[type] / infraTagCount) * 100}%"></div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>

            <div class="section">
                <h2>🎯 Purpose Reflection</h2>
                <div class="purpose-metric">
                    <h3>Declared Purposes: ${purposeTags}</h3>
                    <h3>Lifecycle Expectations: ${expiryTags}</h3>
                    <h3>Responsibility Assignments: ${ownerTags}</h3>
                    <p>${(purposeTags + expiryTags + ownerTags) > 0 ? '✅ Your code reflects thoughtful purpose-driven design' : '💭 Consider adding purpose-driven metadata to express intent'}</p>
                </div>
            </div>

            <div class="section">
                <h2>🌟 Semantic Landscape</h2>
                <div class="chart">
                    <h3>Most Prominent Intentions</h3>
                    ${insights.topPatterns.map(([type, count]: [string, number]) => {
                        const isInfra = infraTags.includes(type);
                        const isPurpose = ['purpose', 'expiry', 'owner'].includes(type);
                        const barClass = isPurpose ? 'purpose-bar' : (isInfra ? 'infra-bar' : 'bar');
                        return `
                        <div>
                            <strong>${type}</strong>: ${count} expressions
                            <div class="${barClass}" style="width: ${(count / insights.totalTags) * 100}%"></div>
                        </div>
                    `;}).join('')}
                </div>

                <div class="metric">
                    <h3>Complete Intent Reflection</h3>
                    <ul>
                        ${Object.entries(insights.tagCounts).map(([type, count]) => {
                            const isInfra = infraTags.includes(type);
                            const isPurpose = ['purpose', 'expiry', 'owner'].includes(type);
                            const emoji = isPurpose ? '🎯' : (isInfra ? '🏗️' : '💻');
                            return `<li>${emoji} <strong>${type}</strong>: ${count} expressions of intent</li>`;
                        }).join('')}
                    </ul>
                </div>
            </div>

            <div class="section">
                <h2>🚀 COSCA Consciousness Score</h2>
                <div class="purpose-metric">
                    <h3>Score: ${Math.round(((infraTagCount + purposeTags + expiryTags + ownerTags) / Math.max(insights.totalTags, 1)) * 100)}%</h3>
                    <p>Measures how consciously your code expresses infrastructure intent and purpose</p>
                </div>
            </div>
        </body>
        </html>`;
    }
}
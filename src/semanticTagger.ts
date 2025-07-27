import * as vscode from 'vscode';
import { TelemetryService } from './telemetry';

export interface SemanticTag {
    type: string;
    label: string;
    line: number;
    column: number;
    length: number;
    confidence: number;
}

export class SemanticTagger {
    private tags: Map<string, SemanticTag[]> = new Map();
    private decorationType: vscode.TextEditorDecorationType;

    constructor(private telemetryService: TelemetryService) {
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            border: '1px solid rgba(255, 193, 7, 0.5)',
            borderRadius: '3px'
        });
    }

    scanDocument(document: vscode.TextDocument): void {
        const text = document.getText();
        const tags = this.extractSemanticTags(text, document.languageId);
        
        this.tags.set(document.uri.toString(), tags);
        this.updateDecorations(document);
        
        // Send telemetry
        this.telemetryService.trackScan(document.languageId, tags);
    }

    private extractSemanticTags(text: string, languageId: string): SemanticTag[] {
        const tags: SemanticTag[] = [];
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // External Communication Intent
            this.findPattern(line, i, /\b(fetch|axios|http\.get|http\.post|XMLHttpRequest)\b/gi, 'network', 'External Communication', tags);
            
            // Development Insights
            this.findPattern(line, i, /\b(console\.log|console\.error|console\.warn|print|println|debugger)\b/gi, 'debug', 'Development Insight', tags);
            
            // Future Intentions
            this.findPattern(line, i, /\b(TODO|FIXME|HACK|XXX|NOTE)\b/gi, 'todo', 'Future Intention', tags);
            
            // Data Interactions
            this.findPattern(line, i, /\b(SELECT|INSERT|UPDATE|DELETE|query|findOne|save|create)\b/gi, 'database', 'Data Interaction', tags);
            
            // Resilience Patterns
            this.findPattern(line, i, /\b(try|catch|throw|error|exception)\b/gi, 'error', 'Resilience Pattern', tags);
            
            // Identity Verification
            this.findPattern(line, i, /\b(auth|login|logout|token|jwt|session|password)\b/gi, 'auth', 'Identity Verification', tags);
            
            // Behavior Configuration
            this.findPattern(line, i, /\b(config|env|process\.env|settings|options)\b/gi, 'config', 'Behavior Configuration', tags);
            
            // Infrastructure Declaration
            this.findPattern(line, i, /\b(terraform|pulumi|cloudformation|aws_|azure_|gcp_|resource|provider)\b/gi, 'iac', 'Infrastructure Declaration', tags);
            
            // Cloud Service Intent
            this.findPattern(line, i, /\b(s3|ec2|lambda|rds|dynamodb|sqs|sns|cloudwatch|ecs|eks|fargate)\b/gi, 'cloud', 'Cloud Service Intent', tags);
            
            // Orchestration Intent
            this.findPattern(line, i, /\b(docker|kubernetes|k8s|pod|deployment|service|ingress|helm)\b/gi, 'container', 'Orchestration Intent', tags);
            
            // Compute Requirements
            this.findPattern(line, i, /\b(cpu|memory|gpu|instance|cluster|node|worker|scale)\b/gi, 'compute', 'Compute Requirement', tags);
            
            // Data Persistence Intent
            this.findPattern(line, i, /\b(bucket|volume|disk|storage|backup|snapshot|archive)\b/gi, 'storage', 'Data Persistence Intent', tags);
            
            // Visibility Intent
            this.findPattern(line, i, /\b(metrics|logs|traces|alert|monitor|dashboard|prometheus|grafana)\b/gi, 'observability', 'Visibility Intent', tags);
            
            // Resource Lifecycle Intent
            this.findPattern(line, i, /\b(create|destroy|provision|deprovision|scale_up|scale_down|terminate)\b/gi, 'lifecycle', 'Resource Lifecycle Intent', tags);
            
            // Economic Considerations
            this.findPattern(line, i, /\b(cost|billing|budget|pricing|reserved|spot|savings)\b/gi, 'cost', 'Economic Consideration', tags);
            
            // Security Boundaries
            this.findPattern(line, i, /\b(iam|role|policy|security_group|vpc|encryption|compliance)\b/gi, 'security', 'Security Boundary', tags);
            
            // Intelligence Infrastructure
            this.findPattern(line, i, /\b(model|training|inference|gpu_cluster|sagemaker|ml_pipeline)\b/gi, 'ml_infra', 'Intelligence Infrastructure', tags);
            
            // Purpose-Driven Metadata (COSCA-specific)
            this.findPattern(line, i, /purpose\s*[:=]\s*["']([^"']+)["']/gi, 'purpose', 'Declared Purpose', tags);
            this.findPattern(line, i, /expiry\s*[:=]\s*["']([^"']+)["']/gi, 'expiry', 'Lifecycle Expectation', tags);
            this.findPattern(line, i, /owner\s*[:=]\s*["']([^"']+)["']/gi, 'owner', 'Responsibility Assignment', tags);
        }

        return tags;
    }

    private findPattern(line: string, lineNumber: number, pattern: RegExp, type: string, label: string, tags: SemanticTag[]): void {
        let match;
        while ((match = pattern.exec(line)) !== null) {
            tags.push({
                type,
                label,
                line: lineNumber,
                column: match.index,
                length: match[0].length,
                confidence: 0.8
            });
        }
    }

    private updateDecorations(document: vscode.TextDocument): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return;
        }

        const tags = this.tags.get(document.uri.toString()) || [];
        const decorations: vscode.DecorationOptions[] = tags.map(tag => ({
            range: new vscode.Range(tag.line, tag.column, tag.line, tag.column + tag.length),
            hoverMessage: `**${tag.label}** (${tag.type})`
        }));

        editor.setDecorations(this.decorationType, decorations);
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
        const allTags: SemanticTag[] = [];
        this.tags.forEach(tags => allTags.push(...tags));

        const tagCounts = allTags.reduce((acc, tag) => {
            acc[tag.type] = (acc[tag.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalTags: allTags.length,
            tagCounts,
            topPatterns: Object.entries(tagCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
        };
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
            </style>
        </head>
        <body>
            <h1>🧠 Semantic Reflection - COSCA Edition</h1>
            
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
/**
 * AST-Based Semantic Analysis Engine
 * More accurate than regex-based pattern matching
 */

import * as ts from 'typescript';

export interface ASTSemanticTag {
    type: string;
    label: string;
    line: number;
    column: number;
    length: number;
    confidence: number;
    match: string;
    astNode: string; // AST node type for debugging
    context?: string; // Additional context from AST
}

export interface CustomTagDefinition {
    name: string;
    description: string;
    matcher: (node: ts.Node, sourceFile: ts.SourceFile) => boolean;
    confidence: number;
    category: 'infrastructure' | 'purpose' | 'general' | 'custom';
}

export class ASTAnalyzer {
    private customTags: CustomTagDefinition[] = [];

    constructor(customTags?: CustomTagDefinition[]) {
        this.customTags = customTags || [];
    }

    /**
     * Analyze TypeScript/JavaScript code using AST
     */
    analyzeTypeScript(code: string, fileName: string = 'temp.ts'): ASTSemanticTag[] {
        const sourceFile = ts.createSourceFile(
            fileName,
            code,
            ts.ScriptTarget.Latest,
            true
        );

        const tags: ASTSemanticTag[] = [];
        this.visitNode(sourceFile, sourceFile, tags);
        return tags;
    }

    /**
     * Add custom tag definitions
     */
    addCustomTags(customTags: CustomTagDefinition[]): void {
        this.customTags.push(...customTags);
    }

    /**
     * Override default tag behavior
     */
    overrideDefaultTags(overrides: Partial<Record<string, CustomTagDefinition>>): void {
        // Implementation for overriding default patterns
        Object.entries(overrides).forEach(([tagType, definition]) => {
            const existingIndex = this.customTags.findIndex(tag => tag.name === tagType);
            if (existingIndex >= 0) {
                this.customTags[existingIndex] = definition;
            } else {
                this.customTags.push(definition);
            }
        });
    }

    private visitNode(node: ts.Node, sourceFile: ts.SourceFile, tags: ASTSemanticTag[]): void {
        // Infrastructure patterns
        this.checkInfrastructurePatterns(node, sourceFile, tags);
        
        // Purpose-driven metadata
        this.checkPurposeMetadata(node, sourceFile, tags);
        
        // General code patterns
        this.checkGeneralPatterns(node, sourceFile, tags);
        
        // Custom user-defined patterns
        this.checkCustomPatterns(node, sourceFile, tags);

        // Recursively visit child nodes
        ts.forEachChild(node, child => this.visitNode(child, sourceFile, tags));
    }

    private checkInfrastructurePatterns(node: ts.Node, sourceFile: ts.SourceFile, tags: ASTSemanticTag[]): void {
        // AWS SDK calls
        if (ts.isCallExpression(node)) {
            const text = node.getText(sourceFile);
            
            // AWS SDK patterns
            if (text.includes('AWS.') || text.includes('aws-sdk')) {
                this.addTag(node, sourceFile, 'cloud', 'AWS Service Call', 0.9, tags, text);
            }
            
            // Terraform provider calls
            if (text.includes('terraform') || text.includes('provider')) {
                this.addTag(node, sourceFile, 'iac', 'Terraform Provider', 0.9, tags, text);
            }
            
            // Docker/Container calls
            if (text.includes('docker') || text.includes('container')) {
                this.addTag(node, sourceFile, 'container', 'Container Operation', 0.9, tags, text);
            }
        }

        // Import statements for infrastructure libraries
        if (ts.isImportDeclaration(node)) {
            const moduleSpecifier = node.moduleSpecifier.getText(sourceFile);
            
            if (moduleSpecifier.includes('aws-sdk') || moduleSpecifier.includes('@aws-sdk')) {
                this.addTag(node, sourceFile, 'cloud', 'AWS SDK Import', 0.95, tags, moduleSpecifier);
            }
            
            if (moduleSpecifier.includes('kubernetes') || moduleSpecifier.includes('k8s')) {
                this.addTag(node, sourceFile, 'container', 'Kubernetes Import', 0.95, tags, moduleSpecifier);
            }
            
            if (moduleSpecifier.includes('terraform') || moduleSpecifier.includes('cdktf')) {
                this.addTag(node, sourceFile, 'iac', 'Terraform Import', 0.95, tags, moduleSpecifier);
            }
        }
    }

    private checkPurposeMetadata(node: ts.Node, sourceFile: ts.SourceFile, tags: ASTSemanticTag[]): void {
        // Object literal properties for purpose metadata
        if (ts.isPropertyAssignment(node)) {
            const propertyName = node.name.getText(sourceFile);
            const propertyValue = node.initializer.getText(sourceFile);
            
            if (propertyName === 'purpose' || propertyName === '"purpose"' || propertyName === "'purpose'") {
                this.addTag(node, sourceFile, 'purpose', 'Resource Purpose', 0.95, tags, propertyValue, propertyValue);
            }
            
            if (propertyName === 'expiry' || propertyName === '"expiry"' || propertyName === "'expiry'") {
                this.addTag(node, sourceFile, 'expiry', 'Resource Expiry', 0.95, tags, propertyValue, propertyValue);
            }
            
            if (propertyName === 'owner' || propertyName === '"owner"' || propertyName === "'owner'") {
                this.addTag(node, sourceFile, 'owner', 'Resource Owner', 0.95, tags, propertyValue, propertyValue);
            }
        }

        // Variable declarations with purpose metadata
        if (ts.isVariableDeclaration(node)) {
            const name = node.name.getText(sourceFile);
            if (name.includes('purpose') || name.includes('owner') || name.includes('expiry')) {
                const type = name.includes('purpose') ? 'purpose' : 
                           name.includes('owner') ? 'owner' : 'expiry';
                this.addTag(node, sourceFile, type, `Resource ${type.charAt(0).toUpperCase() + type.slice(1)}`, 0.8, tags, name);
            }
        }
    }

    private checkGeneralPatterns(node: ts.Node, sourceFile: ts.SourceFile, tags: ASTSemanticTag[]): void {
        // Console.log and debug statements
        if (ts.isCallExpression(node)) {
            const expression = node.expression.getText(sourceFile);
            
            if (expression.includes('console.log') || expression.includes('console.error') || expression.includes('console.warn')) {
                this.addTag(node, sourceFile, 'debug', 'Debug Statement', 0.95, tags, expression);
            }
            
            // Network calls (fetch, axios, etc.)
            if (expression === 'fetch' || expression.includes('axios') || expression.includes('http.get')) {
                this.addTag(node, sourceFile, 'network', 'Network Call', 0.9, tags, expression);
            }
        }

        // Try-catch blocks
        if (ts.isTryStatement(node)) {
            this.addTag(node, sourceFile, 'error', 'Error Handling', 0.9, tags, 'try-catch');
        }

        // TODO comments (from JSDoc or single-line comments)
        const fullText = sourceFile.getFullText();
        const nodeStart = node.getFullStart();
        const nodeEnd = node.getEnd();
        const nodeText = fullText.substring(nodeStart, nodeEnd);
        
        if (nodeText.includes('TODO') || nodeText.includes('FIXME') || nodeText.includes('HACK')) {
            const match = nodeText.match(/(TODO|FIXME|HACK|XXX|NOTE)/i);
            if (match) {
                this.addTag(node, sourceFile, 'todo', 'Unfinished Block', 0.9, tags, match[0]);
            }
        }
    }

    private checkCustomPatterns(node: ts.Node, sourceFile: ts.SourceFile, tags: ASTSemanticTag[]): void {
        for (const customTag of this.customTags) {
            if (customTag.matcher(node, sourceFile)) {
                this.addTag(
                    node, 
                    sourceFile, 
                    customTag.name, 
                    customTag.description, 
                    customTag.confidence, 
                    tags, 
                    node.getText(sourceFile)
                );
            }
        }
    }

    private addTag(
        node: ts.Node, 
        sourceFile: ts.SourceFile, 
        type: string, 
        label: string, 
        confidence: number, 
        tags: ASTSemanticTag[], 
        match: string,
        context?: string
    ): void {
        const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
        
        tags.push({
            type,
            label,
            line: start.line,
            column: start.character,
            length: node.getEnd() - node.getStart(),
            confidence,
            match: match.replace(/['"]/g, ''), // Clean up quotes
            astNode: ts.SyntaxKind[node.kind],
            context
        });
    }
}

// Pre-built custom tag definitions for common patterns
export const INFRASTRUCTURE_CUSTOM_TAGS: CustomTagDefinition[] = [
    {
        name: 'terraform_resource',
        description: 'Terraform Resource Definition',
        category: 'infrastructure',
        confidence: 0.95,
        matcher: (node, sourceFile) => {
            const text = node.getText(sourceFile);
            return ts.isCallExpression(node) && text.includes('resource') && text.includes('aws_');
        }
    },
    {
        name: 'kubernetes_manifest',
        description: 'Kubernetes Manifest Property',
        category: 'infrastructure', 
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            if (ts.isPropertyAssignment(node)) {
                const propName = node.name.getText(sourceFile);
                return ['apiVersion', 'kind', 'metadata', 'spec'].includes(propName.replace(/['"]/g, ''));
            }
            return false;
        }
    },
    {
        name: 'docker_instruction',
        description: 'Docker Instruction',
        category: 'infrastructure',
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            const text = node.getText(sourceFile).toUpperCase();
            return ['FROM', 'RUN', 'COPY', 'ADD', 'EXPOSE', 'CMD', 'ENTRYPOINT'].some(cmd => 
                text.startsWith(cmd + ' ')
            );
        }
    }
];

// Export convenience function
export function createASTAnalyzer(customTags?: CustomTagDefinition[]): ASTAnalyzer {
    return new ASTAnalyzer([...INFRASTRUCTURE_CUSTOM_TAGS, ...(customTags || [])]);
}
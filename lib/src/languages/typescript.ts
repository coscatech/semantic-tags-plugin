/**
 * TypeScript/JavaScript Language-Specific Semantic Analysis
 */

import * as ts from 'typescript';
import { ASTAnalyzer, CustomTagDefinition, ASTSemanticTag } from '../ast-analyzer';

export class TypeScriptAnalyzer extends ASTAnalyzer {
    constructor() {
        super(TYPESCRIPT_CUSTOM_TAGS);
    }

    /**
     * Analyze TypeScript/JavaScript with language-specific patterns
     */
    analyze(code: string, fileName: string = 'temp.ts'): ASTSemanticTag[] {
        return this.analyzeTypeScript(code, fileName);
    }

    /**
     * Detect React/Next.js patterns
     */
    private detectReactPatterns(node: ts.Node, sourceFile: ts.SourceFile): ASTSemanticTag[] {
        const tags: ASTSemanticTag[] = [];
        
        // React component detection
        if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
            const text = node.getText(sourceFile);
            if (text.includes('return') && (text.includes('<') || text.includes('jsx'))) {
                const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                tags.push({
                    type: 'react_component',
                    label: 'React Component',
                    line: start.line,
                    column: start.character,
                    length: node.getEnd() - node.getStart(),
                    confidence: 0.9,
                    match: 'React Component',
                    astNode: ts.SyntaxKind[node.kind]
                });
            }
        }
        
        return tags;
    }

    /**
     * Detect Node.js/Express patterns
     */
    private detectNodePatterns(node: ts.Node, sourceFile: ts.SourceFile): ASTSemanticTag[] {
        const tags: ASTSemanticTag[] = [];
        
        if (ts.isCallExpression(node)) {
            const text = node.getText(sourceFile);
            
            // Express route handlers
            if (text.includes('app.get') || text.includes('app.post') || text.includes('router.')) {
                const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                tags.push({
                    type: 'api_endpoint',
                    label: 'API Endpoint',
                    line: start.line,
                    column: start.character,
                    length: node.getEnd() - node.getStart(),
                    confidence: 0.95,
                    match: text,
                    astNode: ts.SyntaxKind[node.kind]
                });
            }
        }
        
        return tags;
    }
}

// TypeScript-specific custom tags
export const TYPESCRIPT_CUSTOM_TAGS: CustomTagDefinition[] = [
    {
        name: 'aws_sdk_v3',
        description: 'AWS SDK v3 Client',
        category: 'infrastructure',
        confidence: 0.95,
        matcher: (node, sourceFile) => {
            if (ts.isImportDeclaration(node)) {
                const moduleSpecifier = node.moduleSpecifier.getText(sourceFile);
                return moduleSpecifier.includes('@aws-sdk/client-');
            }
            return false;
        }
    },
    {
        name: 'terraform_cdk',
        description: 'Terraform CDK Construct',
        category: 'infrastructure',
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            if (ts.isClassDeclaration(node)) {
                const text = node.getText(sourceFile);
                return text.includes('extends Construct') || text.includes('extends TerraformStack');
            }
            return false;
        }
    },
    {
        name: 'kubernetes_client',
        description: 'Kubernetes Client Operation',
        category: 'infrastructure',
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            if (ts.isCallExpression(node)) {
                const text = node.getText(sourceFile);
                return text.includes('k8sApi.') || text.includes('kubeConfig.');
            }
            return false;
        }
    },
    {
        name: 'docker_compose',
        description: 'Docker Compose Configuration',
        category: 'infrastructure',
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            if (ts.isPropertyAssignment(node)) {
                const propName = node.name.getText(sourceFile).replace(/['"]/g, '');
                return ['services', 'volumes', 'networks', 'version'].includes(propName);
            }
            return false;
        }
    },
    {
        name: 'environment_config',
        description: 'Environment Configuration',
        category: 'general',
        confidence: 0.85,
        matcher: (node, sourceFile) => {
            if (ts.isPropertyAccessExpression(node)) {
                const text = node.getText(sourceFile);
                return text.startsWith('process.env.') || text.includes('NODE_ENV');
            }
            return false;
        }
    },
    {
        name: 'api_endpoint',
        description: 'API Endpoint Definition',
        category: 'general',
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            if (ts.isCallExpression(node)) {
                const text = node.getText(sourceFile);
                return /\.(get|post|put|delete|patch)\s*\(/.test(text);
            }
            return false;
        }
    },
    {
        name: 'database_query',
        description: 'Database Query',
        category: 'general',
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            if (ts.isCallExpression(node)) {
                const text = node.getText(sourceFile);
                return text.includes('.query(') || text.includes('.findOne(') || 
                       text.includes('.create(') || text.includes('.update(');
            }
            return false;
        }
    }
];

// Export factory function
export function createTypeScriptAnalyzer(): TypeScriptAnalyzer {
    return new TypeScriptAnalyzer();
}
"use strict";
/**
 * AST-Based Semantic Analysis Engine
 * More accurate than regex-based pattern matching
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createASTAnalyzer = exports.INFRASTRUCTURE_CUSTOM_TAGS = exports.ASTAnalyzer = void 0;
const ts = __importStar(require("typescript"));
class ASTAnalyzer {
    constructor(customTags) {
        this.customTags = [];
        this.customTags = customTags || [];
    }
    /**
     * Analyze TypeScript/JavaScript code using AST
     */
    analyzeTypeScript(code, fileName = 'temp.ts') {
        const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true);
        const tags = [];
        this.visitNode(sourceFile, sourceFile, tags);
        return tags;
    }
    /**
     * Add custom tag definitions
     */
    addCustomTags(customTags) {
        this.customTags.push(...customTags);
    }
    /**
     * Override default tag behavior
     */
    overrideDefaultTags(overrides) {
        // Implementation for overriding default patterns
        Object.entries(overrides).forEach(([tagType, definition]) => {
            if (definition) {
                const existingIndex = this.customTags.findIndex(tag => tag.name === tagType);
                if (existingIndex >= 0) {
                    this.customTags[existingIndex] = definition;
                }
                else {
                    this.customTags.push(definition);
                }
            }
        });
    }
    visitNode(node, sourceFile, tags) {
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
    checkInfrastructurePatterns(node, sourceFile, tags) {
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
    checkPurposeMetadata(node, sourceFile, tags) {
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
    checkGeneralPatterns(node, sourceFile, tags) {
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
    checkCustomPatterns(node, sourceFile, tags) {
        for (const customTag of this.customTags) {
            if (customTag.matcher(node, sourceFile)) {
                this.addTag(node, sourceFile, customTag.name, customTag.description, customTag.confidence, tags, node.getText(sourceFile));
            }
        }
    }
    addTag(node, sourceFile, type, label, confidence, tags, match, context) {
        const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
        tags.push({
            type,
            label,
            line: start.line,
            column: start.character,
            length: node.getEnd() - node.getStart(),
            confidence,
            match: match.replace(/['"]/g, ''),
            astNode: ts.SyntaxKind[node.kind],
            context
        });
    }
}
exports.ASTAnalyzer = ASTAnalyzer;
// Pre-built custom tag definitions for common patterns
exports.INFRASTRUCTURE_CUSTOM_TAGS = [
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
            return ['FROM', 'RUN', 'COPY', 'ADD', 'EXPOSE', 'CMD', 'ENTRYPOINT'].some(cmd => text.startsWith(cmd + ' '));
        }
    }
];
// Export convenience function
function createASTAnalyzer(customTags) {
    return new ASTAnalyzer([...exports.INFRASTRUCTURE_CUSTOM_TAGS, ...(customTags || [])]);
}
exports.createASTAnalyzer = createASTAnalyzer;
//# sourceMappingURL=ast-analyzer.js.map
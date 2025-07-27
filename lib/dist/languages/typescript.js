"use strict";
/**
 * TypeScript/JavaScript Language-Specific Semantic Analysis
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
exports.createTypeScriptAnalyzer = exports.TYPESCRIPT_CUSTOM_TAGS = exports.TypeScriptAnalyzer = void 0;
const ts = __importStar(require("typescript"));
const ast_analyzer_1 = require("../ast-analyzer");
class TypeScriptAnalyzer extends ast_analyzer_1.ASTAnalyzer {
    constructor() {
        super(exports.TYPESCRIPT_CUSTOM_TAGS);
    }
    /**
     * Analyze TypeScript/JavaScript with language-specific patterns
     */
    analyze(code, fileName = 'temp.ts') {
        return this.analyzeTypeScript(code, fileName);
    }
    /**
     * Detect React/Next.js patterns
     */
    detectReactPatterns(node, sourceFile) {
        const tags = [];
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
    detectNodePatterns(node, sourceFile) {
        const tags = [];
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
exports.TypeScriptAnalyzer = TypeScriptAnalyzer;
// TypeScript-specific custom tags
exports.TYPESCRIPT_CUSTOM_TAGS = [
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
function createTypeScriptAnalyzer() {
    return new TypeScriptAnalyzer();
}
exports.createTypeScriptAnalyzer = createTypeScriptAnalyzer;
//# sourceMappingURL=typescript.js.map
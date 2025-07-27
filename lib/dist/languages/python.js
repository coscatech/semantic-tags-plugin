"use strict";
/**
 * Python Language-Specific Semantic Analysis
 * Uses regex patterns optimized for Python syntax
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPythonAnalyzer = exports.PYTHON_INFRASTRUCTURE_PATTERNS = exports.PythonAnalyzer = void 0;
class PythonAnalyzer {
    constructor(customPatterns) {
        this.customPatterns = [];
        this.customPatterns = [...exports.PYTHON_INFRASTRUCTURE_PATTERNS, ...(customPatterns || [])];
    }
    /**
     * Analyze Python code with language-specific patterns
     */
    analyze(code) {
        const tags = [];
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const context = this.getLineContext(lines, i);
            // Check all patterns
            for (const pattern of this.customPatterns) {
                const matches = this.findMatches(line, i, pattern, context);
                tags.push(...matches);
            }
        }
        return tags;
    }
    /**
     * Add custom Python patterns
     */
    addCustomPatterns(patterns) {
        this.customPatterns.push(...patterns);
    }
    getLineContext(lines, lineIndex) {
        const line = lines[lineIndex];
        const indentLevel = line.length - line.trimStart().length;
        // Look backwards for class/function context
        let isInClass = false;
        let isInFunction = false;
        const decorators = [];
        for (let i = lineIndex - 1; i >= 0; i--) {
            const prevLine = lines[i].trim();
            if (!prevLine)
                continue;
            const prevIndent = lines[i].length - lines[i].trimStart().length;
            if (prevIndent < indentLevel) {
                if (prevLine.startsWith('class ')) {
                    isInClass = true;
                }
                if (prevLine.startsWith('def ')) {
                    isInFunction = true;
                }
                break;
            }
            if (prevLine.startsWith('@')) {
                decorators.unshift(prevLine);
            }
        }
        return {
            isInClass,
            isInFunction,
            indentLevel,
            decorators
        };
    }
    findMatches(line, lineNumber, pattern, context) {
        const tags = [];
        if (pattern.contextFilter && !pattern.contextFilter(context)) {
            return tags;
        }
        let match;
        const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
        while ((match = regex.exec(line)) !== null) {
            tags.push({
                type: pattern.type,
                label: pattern.label,
                line: lineNumber,
                column: match.index,
                length: match[0].length,
                confidence: pattern.confidence,
                match: match[0],
                pythonContext: context
            });
            if (!regex.global)
                break;
        }
        return tags;
    }
}
exports.PythonAnalyzer = PythonAnalyzer;
// Python-specific infrastructure patterns
exports.PYTHON_INFRASTRUCTURE_PATTERNS = [
    // AWS Boto3
    {
        type: 'aws_boto3',
        label: 'AWS Boto3 Client',
        pattern: /boto3\.(client|resource)\s*\(\s*['"]([^'"]+)['"]/g,
        confidence: 0.95,
        category: 'infrastructure'
    },
    // Terraform Python CDK
    {
        type: 'terraform_cdk_python',
        label: 'Terraform CDK Python',
        pattern: /from\s+cdktf\s+import|cdktf\./g,
        confidence: 0.95,
        category: 'infrastructure'
    },
    // Kubernetes Python Client
    {
        type: 'kubernetes_python',
        label: 'Kubernetes Python Client',
        pattern: /from\s+kubernetes\s+import|kubernetes\./g,
        confidence: 0.9,
        category: 'infrastructure'
    },
    // Docker Python SDK
    {
        type: 'docker_python',
        label: 'Docker Python SDK',
        pattern: /import\s+docker|docker\.(from_env|APIClient)/g,
        confidence: 0.9,
        category: 'infrastructure'
    },
    // Pulumi
    {
        type: 'pulumi_python',
        label: 'Pulumi Infrastructure',
        pattern: /import\s+pulumi|pulumi\./g,
        confidence: 0.95,
        category: 'infrastructure'
    },
    // FastAPI endpoints
    {
        type: 'fastapi_endpoint',
        label: 'FastAPI Endpoint',
        pattern: /@app\.(get|post|put|delete|patch)\s*\(/g,
        confidence: 0.95,
        category: 'general'
    },
    // Django models/views
    {
        type: 'django_model',
        label: 'Django Model',
        pattern: /class\s+\w+\s*\(\s*models\.Model\s*\)/g,
        confidence: 0.95,
        category: 'general',
        contextFilter: (context) => context.isInClass
    },
    // Flask routes
    {
        type: 'flask_route',
        label: 'Flask Route',
        pattern: /@app\.route\s*\(/g,
        confidence: 0.95,
        category: 'general'
    },
    // SQLAlchemy
    {
        type: 'sqlalchemy_query',
        label: 'SQLAlchemy Query',
        pattern: /\.(query|filter|join|select)\s*\(/g,
        confidence: 0.9,
        category: 'general'
    },
    // Celery tasks
    {
        type: 'celery_task',
        label: 'Celery Task',
        pattern: /@celery\.task|@shared_task/g,
        confidence: 0.9,
        category: 'general'
    },
    // Environment variables
    {
        type: 'env_config_python',
        label: 'Environment Configuration',
        pattern: /os\.environ\.|os\.getenv\(|getenv\(/g,
        confidence: 0.85,
        category: 'general'
    },
    // Logging
    {
        type: 'python_logging',
        label: 'Python Logging',
        pattern: /logging\.(debug|info|warning|error|critical)|logger\./g,
        confidence: 0.9,
        category: 'general'
    },
    // Purpose-driven metadata in Python
    {
        type: 'purpose_python',
        label: 'Resource Purpose',
        pattern: /purpose\s*[:=]\s*['"]([^'"]+)['"]/g,
        confidence: 0.95,
        category: 'purpose'
    },
    {
        type: 'owner_python',
        label: 'Resource Owner',
        pattern: /owner\s*[:=]\s*['"]([^'"]+)['"]/g,
        confidence: 0.95,
        category: 'purpose'
    },
    {
        type: 'expiry_python',
        label: 'Resource Expiry',
        pattern: /expiry\s*[:=]\s*['"]([^'"]+)['"]/g,
        confidence: 0.95,
        category: 'purpose'
    },
    // ML/AI Infrastructure
    {
        type: 'ml_training_python',
        label: 'ML Training Code',
        pattern: /\.(fit|train|predict|transform)\s*\(|model\.(save|load)/g,
        confidence: 0.9,
        category: 'infrastructure'
    },
    // Data processing
    {
        type: 'data_processing_python',
        label: 'Data Processing',
        pattern: /pandas\.|numpy\.|pd\.|np\./g,
        confidence: 0.8,
        category: 'general'
    }
];
// Export factory function
function createPythonAnalyzer(customPatterns) {
    return new PythonAnalyzer(customPatterns);
}
exports.createPythonAnalyzer = createPythonAnalyzer;
//# sourceMappingURL=python.js.map
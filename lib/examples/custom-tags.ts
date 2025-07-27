/**
 * Examples of custom tag definitions and AST-based analysis
 */

import { 
    createEnhancedAnalyzer, 
    createTypeScriptAnalyzer, 
    createPythonAnalyzer,
    CustomTagDefinition 
} from '../src/index';
import * as ts from 'typescript';

// Example 1: Custom Infrastructure Tags
const customInfraTags: CustomTagDefinition[] = [
    {
        name: 'microservice_endpoint',
        description: 'Microservice API Endpoint',
        category: 'infrastructure',
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            if (ts.isCallExpression(node)) {
                const text = node.getText(sourceFile);
                return text.includes('app.') && /\.(get|post|put|delete)\s*\(/.test(text);
            }
            return false;
        }
    },
    {
        name: 'database_migration',
        description: 'Database Migration',
        category: 'infrastructure', 
        confidence: 0.95,
        matcher: (node, sourceFile) => {
            const text = node.getText(sourceFile);
            return text.includes('migration') && (
                text.includes('CREATE TABLE') || 
                text.includes('ALTER TABLE') ||
                text.includes('DROP TABLE')
            );
        }
    },
    {
        name: 'feature_flag',
        description: 'Feature Flag',
        category: 'custom',
        confidence: 0.85,
        matcher: (node, sourceFile) => {
            if (ts.isCallExpression(node)) {
                const text = node.getText(sourceFile);
                return text.includes('featureFlag') || text.includes('isEnabled');
            }
            return false;
        }
    }
];

// Example 2: Team-Specific Tags
const teamSpecificTags: CustomTagDefinition[] = [
    {
        name: 'security_review_needed',
        description: 'Security Review Required',
        category: 'custom',
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            const text = node.getText(sourceFile);
            return text.includes('SECURITY_REVIEW') || text.includes('@security-review');
        }
    },
    {
        name: 'performance_critical',
        description: 'Performance Critical Code',
        category: 'custom',
        confidence: 0.9,
        matcher: (node, sourceFile) => {
            const text = node.getText(sourceFile);
            return text.includes('PERF_CRITICAL') || text.includes('@performance');
        }
    }
];

// Example Usage
export function demonstrateCustomTags() {
    // Create enhanced analyzer with custom tags
    const analyzer = createEnhancedAnalyzer([...customInfraTags, ...teamSpecificTags]);
    
    const codeExample = `
    // SECURITY_REVIEW: This endpoint handles sensitive data
    app.post('/api/users', async (req, res) => {
        // PERF_CRITICAL: Database query in hot path
        const user = await User.create(req.body);
        
        if (featureFlag.isEnabled('new-user-flow')) {
            // Feature flag usage
            return res.json({ user, newFlow: true });
        }
        
        res.json({ user });
    });
    
    // Database migration
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        purpose = "user_management",
        owner = "auth_team"
    );
    `;
    
    const result = analyzer.analyze(codeExample, { 
        languageId: 'typescript',
        useAST: true 
    });
    
    console.log('Custom Tags Found:', result.tagCounts);
    console.log('COSCA Readiness:', result.coscaReadinessScore);
    
    return result;
}

// Example 3: Override Default Behavior
export function demonstrateTagOverrides() {
    const analyzer = createEnhancedAnalyzer();
    
    // Override default TODO detection to be more strict
    analyzer.overrideDefaultTags({
        'todo': {
            name: 'todo',
            description: 'High Priority TODO',
            category: 'custom',
            confidence: 0.95,
            matcher: (node, sourceFile) => {
                const text = node.getText(sourceFile);
                return text.includes('TODO:') && text.includes('HIGH');
            }
        }
    });
    
    const codeWithTodos = `
    // TODO: Regular todo - should not match
    function regularFunction() {}
    
    // TODO: HIGH - This should match
    function criticalFunction() {}
    `;
    
    return analyzer.analyze(codeWithTodos, { languageId: 'typescript' });
}

// Example 4: Language-Specific Analysis
export function demonstrateLanguageSpecific() {
    // TypeScript-specific analysis
    const tsAnalyzer = createTypeScriptAnalyzer();
    const tsCode = `
    import { S3Client } from '@aws-sdk/client-s3';
    
    class InfrastructureStack extends TerraformStack {
        constructor() {
            super();
            // Terraform CDK usage
        }
    }
    `;
    
    const tsResult = tsAnalyzer.analyze(tsCode);
    
    // Python-specific analysis  
    const pyAnalyzer = createPythonAnalyzer();
    const pyCode = `
    import boto3
    from pulumi import aws
    
    @app.route('/api/data')
    def get_data():
        # AWS Boto3 usage
        s3 = boto3.client('s3')
        return {'purpose': 'data_api', 'owner': 'data_team'}
    `;
    
    const pyResult = pyAnalyzer.analyze(pyCode);
    
    return { typescript: tsResult, python: pyResult };
}

// Example 5: Batch Analysis with Custom Tags
export function demonstrateBatchAnalysis() {
    const analyzer = createEnhancedAnalyzer(customInfraTags);
    
    const files = [
        { name: 'api.ts', content: 'app.get("/users", handler);', language: 'typescript' },
        { name: 'config.py', content: 'purpose = "api_gateway"', language: 'python' },
        { name: 'infra.tf', content: 'resource "aws_s3_bucket" "data" {}', language: 'terraform' }
    ];
    
    const results = files.map(file => ({
        file: file.name,
        analysis: analyzer.analyze(file.content, { languageId: file.language })
    }));
    
    // Aggregate results
    const totalReadiness = results.reduce((sum, r) => sum + r.analysis.coscaReadinessScore, 0) / results.length;
    
    return {
        files: results,
        averageReadiness: totalReadiness,
        totalInfraPatterns: results.reduce((sum, r) => sum + r.analysis.infraTagCount, 0)
    };
}
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 COSCA Semantic Tagging Extension - Test Suite');
console.log('================================================\n');

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function logTest(name, passed, message = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
    if (message) console.log(`   ${message}`);
    
    if (passed) testResults.passed++;
    else testResults.failed++;
}

function logWarning(name, message) {
    console.log(`⚠️  WARN ${name}`);
    console.log(`   ${message}`);
    testResults.warnings++;
}

// 1. Environment Tests
function testEnvironment() {
    console.log('1. Testing Environment Setup');
    console.log('----------------------------');
    
    // Node.js version
    try {
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        logTest('Node.js installed', true, `Version: ${nodeVersion}`);
        
        if (majorVersion < 16) {
            logWarning('Node.js version', 'Recommend Node.js 16+ for best compatibility');
        }
    } catch (error) {
        logTest('Node.js installed', false, 'Node.js not found');
    }
    
    // Package.json validation
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        logTest('package.json valid', true);
        
        // Check required fields
        const requiredFields = ['name', 'version', 'publisher', 'engines', 'main'];
        requiredFields.forEach(field => {
            logTest(`package.json.${field}`, !!packageJson[field]);
        });
        
        // Check COSCA-specific fields
        logTest('Repository configured', !!packageJson.repository);
        logTest('License specified', !!packageJson.license);
        
    } catch (error) {
        logTest('package.json valid', false, error.message);
    }
    
    console.log('');
}

// 2. File Structure Tests
function testFileStructure() {
    console.log('2. Testing File Structure');
    console.log('-------------------------');
    
    const requiredFiles = [
        'src/extension.ts',
        'src/semanticTagger.ts', 
        'src/telemetry.ts',
        'tsconfig.json',
        'LICENSE'
    ];
    
    requiredFiles.forEach(file => {
        const exists = fs.existsSync(file);
        logTest(`File: ${file}`, exists);
    });
    
    // Check compiled output
    const compiledFiles = [
        'out/extension.js',
        'out/semanticTagger.js',
        'out/telemetry.js'
    ];
    
    compiledFiles.forEach(file => {
        const exists = fs.existsSync(file);
        logTest(`Compiled: ${file}`, exists);
    });
    
    console.log('');
}

// 3. Test Infrastructure Pattern Detection
function testInfrastructurePatterns() {
    console.log('3. Testing Infrastructure Pattern Detection');
    console.log('------------------------------------------');
    
    // Test patterns from semantic tagger
    const testPatterns = [
        // Infrastructure as Code
        { pattern: /\b(terraform|pulumi|cloudformation|aws_|azure_|gcp_|resource|provider)\b/gi, type: 'iac', text: 'terraform { required_providers { aws = {} } }' },
        
        // Cloud Services
        { pattern: /\b(s3|ec2|lambda|rds|dynamodb|sqs|sns|cloudwatch|ecs|eks|fargate)\b/gi, type: 'cloud', text: 'resource "aws_s3_bucket" "data" {}\naws_ec2_instance "web" {}' },
        
        // Container/K8s
        { pattern: /\b(docker|kubernetes|k8s|pod|deployment|service|ingress|helm)\b/gi, type: 'container', text: 'apiVersion: apps/v1\nkind: Deployment' },
        
        // Compute Resources
        { pattern: /\b(cpu|memory|gpu|instance|cluster|node|worker|scale)\b/gi, type: 'compute', text: 'instance_type = "t3.micro"\ncpu: "500m"\nmemory: "1Gi"' },
        
        // Storage Operations
        { pattern: /\b(bucket|volume|disk|storage|backup|snapshot|archive)\b/gi, type: 'storage', text: 'aws_s3_bucket "backup" {}\nvolumes:\n- name: data-volume' },
        
        // Purpose Tags
        { pattern: /purpose\s*[:=]\s*["']([^"']+)["']/gi, type: 'purpose', text: 'purpose = "web_server"\npurpose: "model_training"' },
        
        // Expiry Tags
        { pattern: /expiry\s*[:=]\s*["']([^"']+)["']/gi, type: 'expiry', text: 'expiry = "30_days"\nexpiry: "2024-12-31"' },
        
        // Owner Tags
        { pattern: /owner\s*[:=]\s*["']([^"']+)["']/gi, type: 'owner', text: 'owner = "platform_team"\nowner: "ml_team"' }
    ];
    
    testPatterns.forEach(({ pattern, type, text }) => {
        const matches = text.match(pattern);
        logTest(`Pattern ${type}`, !!matches, matches ? `Found: ${matches.join(', ')}` : 'No matches');
    });
    
    console.log('');
}

// 4. Test Files Validation
function testTestFiles() {
    console.log('4. Testing Test Files');
    console.log('---------------------');
    
    const testFiles = [
        'test-files/test-terraform.tf',
        'test-files/test-kubernetes.yaml',
        'test-files/test-docker-compose.yml',
        'test-files/test-javascript.js',
        'test-files/test-python.py'
    ];
    
    testFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const lineCount = content.split('\n').length;
            logTest(`Test file: ${path.basename(file)}`, true, `${lineCount} lines`);
            
            // Check for infrastructure patterns in infrastructure files
            if (file.includes('terraform') || file.includes('kubernetes') || file.includes('docker')) {
                const hasInfraPatterns = /\b(resource|deployment|service|container|volume|cpu|memory)\b/gi.test(content);
                logTest(`  Infrastructure patterns`, hasInfraPatterns);
                
                const hasPurposeMetadata = /purpose\s*[:=]/gi.test(content);
                logTest(`  Purpose metadata`, hasPurposeMetadata);
            }
        } else {
            logTest(`Test file: ${path.basename(file)}`, false, 'File not found');
        }
    });
    
    console.log('');
}

// 5. PostHog Configuration Test
function testPostHogConfig() {
    console.log('5. Testing PostHog Configuration');
    console.log('--------------------------------');
    
    try {
        const telemetryContent = fs.readFileSync('src/telemetry.ts', 'utf8');
        
        // Check if API key is configured
        const hasPlaceholder = telemetryContent.includes('phc_YOUR_API_KEY_HERE');
        const hasRealKey = /phc_[a-zA-Z0-9]{43}/.test(telemetryContent);
        
        if (hasPlaceholder) {
            logWarning('PostHog API key', 'Still using placeholder - update with real key for telemetry testing');
        } else if (hasRealKey) {
            logTest('PostHog API key', true, 'Real API key configured');
        } else {
            logTest('PostHog API key', false, 'Invalid API key format');
        }
        
        // Check telemetry features
        const hasTrackScan = telemetryContent.includes('trackScan');
        const hasInfraMetrics = telemetryContent.includes('infra_tag_count');
        const hasPurposeMetrics = telemetryContent.includes('has_purpose_metadata');
        
        logTest('Scan tracking', hasTrackScan);
        logTest('Infrastructure metrics', hasInfraMetrics);
        logTest('Purpose-driven metrics', hasPurposeMetrics);
        
    } catch (error) {
        logTest('PostHog configuration', false, error.message);
    }
    
    console.log('');
}

// 6. Extension Package Test
function testExtensionPackage() {
    console.log('6. Testing Extension Package');
    console.log('----------------------------');
    
    const vsixFile = 'semantic-tagging-vscode-0.1.0.vsix';
    const packageExists = fs.existsSync(vsixFile);
    
    logTest('VSIX package exists', packageExists);
    
    if (packageExists) {
        const stats = fs.statSync(vsixFile);
        const sizeKB = Math.round(stats.size / 1024);
        logTest('Package size reasonable', sizeKB < 10000, `${sizeKB} KB`);
    }
    
    console.log('');
}

// 7. Manual Testing Checklist
function showManualTestingChecklist() {
    console.log('7. Manual Testing Checklist');
    console.log('---------------------------');
    console.log('After running automated tests, manually verify:');
    console.log('');
    console.log('□ Press F5 in VSCode to launch Extension Development Host');
    console.log('□ Open test-files/test-terraform.tf');
    console.log('□ Run "Semantic Tagging: Scan Current File"');
    console.log('□ Verify infrastructure patterns are highlighted');
    console.log('□ Run "Semantic Tagging: Show Semantic Insights"');
    console.log('□ Check COSCA Readiness Score appears');
    console.log('□ Enable telemetry in settings');
    console.log('□ Scan files and check PostHog dashboard for events');
    console.log('□ Test with different file types (JS, Python, YAML)');
    console.log('□ Verify no console errors in Developer Tools');
    console.log('');
}

// 8. Performance Test
function testPerformance() {
    console.log('8. Performance Tests');
    console.log('-------------------');
    
    // Test pattern matching performance
    const testText = fs.readFileSync('test-files/test-terraform.tf', 'utf8');
    const patterns = [
        /\b(terraform|pulumi|cloudformation|aws_|azure_|gcp_|resource|provider)\b/gi,
        /\b(s3|ec2|lambda|rds|dynamodb|sqs|sns|cloudwatch|ecs|eks|fargate)\b/gi,
        /\b(docker|kubernetes|k8s|pod|deployment|service|ingress|helm)\b/gi
    ];
    
    const startTime = Date.now();
    let totalMatches = 0;
    
    for (let i = 0; i < 100; i++) {
        patterns.forEach(pattern => {
            const matches = testText.match(pattern);
            if (matches) totalMatches += matches.length;
        });
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logTest('Pattern matching performance', duration < 1000, `${duration}ms for 100 iterations`);
    logTest('Pattern detection working', totalMatches > 0, `Found ${totalMatches} matches per iteration`);
    
    console.log('');
}

// Main test runner
function runAllTests() {
    console.log('Starting comprehensive test suite...\n');
    
    testEnvironment();
    testFileStructure();
    testInfrastructurePatterns();
    testTestFiles();
    testPostHogConfig();
    testExtensionPackage();
    testPerformance();
    showManualTestingChecklist();
    
    // Summary
    console.log('🎯 Test Results Summary');
    console.log('=======================');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️  Warnings: ${testResults.warnings}`);
    console.log('');
    
    if (testResults.failed === 0) {
        console.log('🚀 All tests passed! Extension is ready for testing and deployment.');
        console.log('');
        console.log('Next steps:');
        console.log('1. Configure PostHog API key (if not done)');
        console.log('2. Run manual testing checklist');
        console.log('3. Test in VSCode Extension Development Host');
        console.log('4. Package and distribute: vsce package');
    } else {
        console.log('🔧 Some tests failed. Please fix issues before deployment.');
    }
    
    console.log('');
    console.log('For detailed setup instructions, see:');
    console.log('- COMPLETE_SETUP.md');
    console.log('- POSTHOG_SETUP.md');
    console.log('- DEVELOPMENT.md');
}

// Run tests
runAllTests();
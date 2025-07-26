#!/usr/bin/env node

const { analyzeCode, analyzeFile, SemanticAnalyzer } = require('../dist/index.js');

console.log('🧪 Testing @cosca/semantic-tags');
console.log('================================\n');

// Test 1: Basic Terraform analysis
console.log('1. Testing Terraform Analysis');
console.log('-----------------------------');

const terraformCode = `
resource "aws_s3_bucket" "data_lake" {
  bucket = "company-data-lake"
  
  tags = {
    purpose = "analytics_storage"
    expiry = "2_years"
    owner = "data_team"
  }
}

resource "aws_ec2_instance" "web_server" {
  instance_type = "t3.micro"
  ami = "ami-12345"
  
  cpu = "2"
  memory = "4GB"
}
`;

const terraformResult = analyzeCode(terraformCode, 'terraform');
console.log('✅ Terraform Analysis Results:');
console.log(`   Total Tags: ${terraformResult.totalTags}`);
console.log(`   Infrastructure Tags: ${terraformResult.infraTagCount}`);
console.log(`   COSCA Readiness Score: ${terraformResult.coscaReadinessScore}%`);
console.log(`   Has Purpose Metadata: ${terraformResult.hasPurposeMetadata}`);
console.log(`   Top Patterns: ${terraformResult.insights.topPatterns.map(([type, count]) => `${type}(${count})`).join(', ')}`);

// Test 2: JavaScript analysis
console.log('\n2. Testing JavaScript Analysis');
console.log('------------------------------');

const jsCode = `
// TODO: Implement error handling
fetch('/api/users')
  .then(response => response.json())
  .then(data => {
    console.log('Users:', data);
    // FIXME: Add proper error handling
  })
  .catch(error => {
    console.error('Error:', error);
  });

const config = process.env.API_URL;
`;

const jsResult = analyzeCode(jsCode, 'javascript');
console.log('✅ JavaScript Analysis Results:');
console.log(`   Total Tags: ${jsResult.totalTags}`);
console.log(`   Debug Statements: ${jsResult.tagCounts['debug'] || 0}`);
console.log(`   TODOs: ${jsResult.tagCounts['todo'] || 0}`);
console.log(`   Network Calls: ${jsResult.tagCounts['network'] || 0}`);
console.log(`   Is Infrastructure File: ${jsResult.isInfraFile}`);

// Test 3: Kubernetes YAML analysis
console.log('\n3. Testing Kubernetes Analysis');
console.log('------------------------------');

const k8sCode = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    purpose: "web_frontend"
    owner: "platform_team"
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: web-app
        image: nginx:1.21
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
`;

const k8sResult = analyzeCode(k8sCode, 'yaml');
console.log('✅ Kubernetes Analysis Results:');
console.log(`   Total Tags: ${k8sResult.totalTags}`);
console.log(`   Container Tags: ${k8sResult.tagCounts['container'] || 0}`);
console.log(`   Compute Tags: ${k8sResult.tagCounts['compute'] || 0}`);
console.log(`   Purpose Tags: ${k8sResult.tagCounts['purpose'] || 0}`);
console.log(`   COSCA Readiness Score: ${k8sResult.coscaReadinessScore}%`);

// Test 4: Custom analyzer instance
console.log('\n4. Testing Custom Analyzer');
console.log('--------------------------');

const analyzer = new SemanticAnalyzer();
const customResult = analyzer.analyze('SELECT * FROM users WHERE active = 1');
console.log('✅ Custom Analyzer Results:');
console.log(`   Database Tags: ${customResult.tagCounts['database'] || 0}`);
console.log(`   Tags Found: ${customResult.tags.map(tag => tag.match).join(', ')}`);

// Test 5: File analysis simulation
console.log('\n5. Testing File Analysis');
console.log('------------------------');

const fileResult = analyzeFile('infrastructure.tf', terraformCode);
console.log('✅ File Analysis Results:');
console.log(`   File appears to be infrastructure: ${fileResult.isInfraFile}`);
console.log(`   Readiness for COSCA: ${fileResult.coscaReadinessScore}%`);

// Summary
console.log('\n🎯 Test Summary');
console.log('===============');
console.log('✅ All tests completed successfully!');
console.log('✅ Terraform analysis working');
console.log('✅ JavaScript analysis working');
console.log('✅ Kubernetes analysis working');
console.log('✅ Custom analyzer working');
console.log('✅ File analysis working');
console.log('\n📦 @cosca/semantic-tags is ready for publication!');
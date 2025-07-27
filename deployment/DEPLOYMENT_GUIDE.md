# 🚀 COSCA Semantic Tagging - Production Deployment Guide

## 📋 Deployment Overview

This guide covers deploying the complete COSCA semantic tagging ecosystem:
- **VSCode Extension** - Marketplace publication
- **NPM Package** - Registry publication  
- **LLM Insights Dashboard** - Web deployment
- **Monetization Platform** - Integration with coscatech.com

## 🎯 Deployment Targets

### 1. **VSCode Marketplace** 
- Extension for developers
- Free tier with upgrade prompts

### 2. **NPM Registry**
- Reusable semantic engine
- Open source with premium features

### 3. **Production Dashboard**
- insights.cosca.tech
- Full LLM-powered analytics

### 4. **Main Website Integration**
- coscatech.com/semantic-insights
- Marketing and sales pages

---

## 🔧 Pre-Deployment Checklist

### ✅ **Security Verification**
- [ ] IP protection active (encrypted patterns)
- [ ] .gitignore excludes sensitive files
- [ ] Encryption keys secured
- [ ] Protected semantic tagger tested
- [ ] Telemetry sanitization verified

### ✅ **Code Quality**
- [ ] All tests passing
- [ ] TypeScript compilation clean
- [ ] ESLint warnings resolved
- [ ] Security audit completed
- [ ] Performance benchmarks met

### ✅ **Configuration**
- [ ] Production environment variables set
- [ ] PostHog API keys configured
- [ ] OpenAI API keys secured
- [ ] Database connections tested
- [ ] SSL certificates ready

---

## 📦 1. VSCode Extension Deployment

### Build and Package
```bash
# Install dependencies
npm install

# Run security protection
npm run security:protect

# Compile TypeScript
npm run compile

# Package extension
npm run package
```

### Publish to Marketplace
```bash
# Install VSCE (if not already installed)
npm install -g vsce

# Login to Visual Studio Marketplace
vsce login cosca

# Publish extension
vsce publish

# Verify publication
vsce show cosca.semantic-tagging-vscode
```

### Post-Publication
- Update README with marketplace link
- Create release notes
- Monitor download metrics
- Set up automated updates

---

## 📚 2. NPM Package Deployment

### Build Library
```bash
cd lib

# Install dependencies
npm install

# Build package
npm run build

# Run tests
npm test

# Security audit
npm audit
```

### Publish to NPM
```bash
# Login to NPM
npm login

# Publish package
npm publish

# Verify publication
npm view cosca-semantic-tags
```

### Version Management
```bash
# Update version
npm version patch  # or minor/major

# Publish new version
npm publish

# Tag release
git tag v1.2.0
git push origin v1.2.0
```

---

## 🌐 3. Dashboard Deployment

### Environment Setup
```bash
cd llm-insights-dashboard

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with production values
```

### Production Environment Variables
```env
# Server Configuration
NODE_ENV=production
PORT=3000

# PostHog Configuration
POSTHOG_API_KEY=your_production_posthog_key
POSTHOG_HOST=https://app.posthog.com

# OpenAI Configuration
OPENAI_API_KEY=your_production_openai_key

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/cosca_insights

# Security
JWT_SECRET=your_production_jwt_secret
API_RATE_LIMIT=1000

# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
ALERT_EMAIL=alerts@cosca.tech

# Slack Configuration
SLACK_TOKEN=xoxb-your-production-slack-token
SLACK_CHANNEL=#cosca-alerts
```

### Docker Deployment
```dockerfile
# Create Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S cosca -u 1001

# Set permissions
RUN chown -R cosca:nodejs /app
USER cosca

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Build and Deploy
```bash
# Build Docker image
docker build -t cosca-insights-dashboard .

# Tag for registry
docker tag cosca-insights-dashboard:latest registry.cosca.tech/insights-dashboard:latest

# Push to registry
docker push registry.cosca.tech/insights-dashboard:latest

# Deploy to production
kubectl apply -f k8s/deployment.yaml
```

---

## ☁️ 4. Cloud Infrastructure

### AWS Deployment (Recommended)

#### ECS Fargate Setup
```yaml
# ecs-task-definition.json
{
  "family": "cosca-insights-dashboard",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "dashboard",
      "image": "registry.cosca.tech/insights-dashboard:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:cosca/openai-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cosca-insights-dashboard",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Application Load Balancer
```yaml
# alb-config.yaml
apiVersion: v1
kind: Service
metadata:
  name: cosca-insights-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: LoadBalancer
  ports:
    - port: 443
      targetPort: 3000
      protocol: TCP
  selector:
    app: cosca-insights-dashboard
```

### Database Setup (RDS PostgreSQL)
```sql
-- Create production database
CREATE DATABASE cosca_insights_prod;

-- Create application user
CREATE USER cosca_app WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE cosca_insights_prod TO cosca_app;

-- Create tables (run migration scripts)
\i migrations/001_initial_schema.sql
```

---

## 🔒 5. Security Configuration

### SSL/TLS Setup
```bash
# Generate SSL certificate (Let's Encrypt)
certbot certonly --webroot -w /var/www/html -d insights.cosca.tech

# Configure nginx
server {
    listen 443 ssl http2;
    server_name insights.cosca.tech;
    
    ssl_certificate /etc/letsencrypt/live/insights.cosca.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/insights.cosca.tech/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Secrets Management
```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
    --name "cosca/production/openai-key" \
    --description "OpenAI API key for production" \
    --secret-string "your-openai-api-key"

aws secretsmanager create-secret \
    --name "cosca/production/database-url" \
    --description "Database connection string" \
    --secret-string "postgresql://user:pass@host:5432/db"
```

---

## 📊 6. Monitoring & Observability

### Application Monitoring
```javascript
// monitoring/setup.js
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const activeUsers = new prometheus.Gauge({
  name: 'cosca_active_users',
  help: 'Number of active users'
});

// Export metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### Log Aggregation
```yaml
# fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/cosca-insights-*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag cosca.insights.*
      format json
    </source>
    
    <match cosca.insights.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name cosca-insights
    </match>
```

---

## 🚀 7. CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy COSCA Semantic Insights

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  security-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security protection
        run: npm run security:protect
      - name: Verify IP protection
        run: npm run security:validate

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Security audit
        run: npm audit

  build-extension:
    needs: [security-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build VSCode extension
        run: |
          npm ci
          npm run compile
          npm run package
      - name: Upload extension artifact
        uses: actions/upload-artifact@v3
        with:
          name: vscode-extension
          path: '*.vsix'

  build-dashboard:
    needs: [security-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: |
          cd llm-insights-dashboard
          docker build -t cosca-insights-dashboard .
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push cosca-insights-dashboard:latest

  deploy-production:
    needs: [build-extension, build-dashboard]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - name: Deploy to production
        run: |
          # Deploy dashboard
          kubectl set image deployment/cosca-insights-dashboard dashboard=cosca-insights-dashboard:${{ github.ref_name }}
          
          # Publish VSCode extension
          vsce publish --pat ${{ secrets.VSCE_TOKEN }}
          
          # Publish NPM package
          cd lib && npm publish --access public
```

---

## 📈 8. Post-Deployment

### Verification Checklist
- [ ] VSCode extension available in marketplace
- [ ] NPM package published and installable
- [ ] Dashboard accessible at production URL
- [ ] SSL certificate valid
- [ ] Health checks passing
- [ ] Monitoring dashboards active
- [ ] Error tracking configured
- [ ] Performance metrics baseline established

### Marketing Launch
- [ ] Update coscatech.com with new features
- [ ] Create launch blog post
- [ ] Social media announcements
- [ ] Developer community outreach
- [ ] Documentation site updated
- [ ] Video demos created

### Success Metrics
- **VSCode Extension**: Downloads, ratings, user feedback
- **NPM Package**: Downloads, GitHub stars, issues
- **Dashboard**: Active users, conversion rates, revenue
- **Overall**: Brand awareness, market penetration

---

## 🆘 Emergency Procedures

### Rollback Process
```bash
# Rollback VSCode extension
vsce unpublish cosca.semantic-tagging-vscode@1.2.0

# Rollback NPM package
npm unpublish cosca-semantic-tags@1.2.0

# Rollback dashboard
kubectl rollout undo deployment/cosca-insights-dashboard
```

### Incident Response
1. **Identify issue** - monitoring alerts
2. **Assess impact** - user reports, metrics
3. **Implement fix** - hotfix or rollback
4. **Communicate** - status page, users
5. **Post-mortem** - root cause analysis

---

## 📞 Support Contacts

- **DevOps**: devops@cosca.tech
- **Security**: security@cosca.tech  
- **Product**: product@cosca.tech
- **Emergency**: +1-555-COSCA-911

---

**🎉 Ready for Production Deployment!**

Your COSCA semantic tagging system is now ready for enterprise-scale deployment with comprehensive monitoring, security, and monetization capabilities.
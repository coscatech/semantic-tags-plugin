# Self-Hosted PostHog Setup for Teams

🏢 **Enterprise teams can run their own PostHog instance to maintain full control over telemetry data.**

## 🎯 Why Self-Host?

- **Data Sovereignty**: Keep all telemetry data within your infrastructure
- **Compliance**: Meet regulatory requirements (GDPR, HIPAA, SOC2)
- **Custom Analytics**: Build team-specific dashboards and insights
- **Privacy Control**: No data leaves your environment

## 🚀 Quick Setup

### 1. Deploy PostHog

#### Option A: Docker Compose (Recommended)
```bash
# Clone PostHog
git clone https://github.com/PostHog/posthog.git
cd posthog

# Start PostHog
docker-compose up -d
```

#### Option B: Kubernetes
```bash
# Add PostHog Helm repo
helm repo add posthog https://posthog.github.io/charts-clickhouse/
helm repo update

# Install PostHog
helm install posthog posthog/posthog --set cloud=private
```

#### Option C: Cloud Providers
- **AWS**: Use PostHog's CloudFormation template
- **GCP**: Deploy via Google Cloud Marketplace
- **Azure**: Use Azure Container Instances

### 2. Configure VSCode Extension

Once PostHog is running, configure the extension:

#### Via VSCode Settings UI:
1. Open VSCode Settings (`Ctrl+,`)
2. Search "semantic tagging"
3. Configure:
   - ✅ **Enable Telemetry**: `true`
   - 🌐 **Telemetry Host**: `https://your-posthog-instance.com`
   - 🔑 **Telemetry API Key**: `phc_your_project_api_key`

#### Via settings.json:
```json
{
  "semanticTagging.enableTelemetry": true,
  "semanticTagging.telemetryHost": "https://your-posthog-instance.com",
  "semanticTagging.telemetryApiKey": "phc_your_project_api_key"
}
```

### 3. Get Your API Key

1. Open your PostHog instance
2. Go to **Project Settings** → **Project API Key**
3. Copy the key (starts with `phc_`)

## 📊 Team Analytics Dashboard

Create custom insights for your team:

### Infrastructure Adoption Metrics
```sql
-- Track infrastructure pattern adoption over time
SELECT 
  toDate(timestamp) as date,
  sumIf(properties.infra_tag_count, properties.is_infra_file = true) as infra_patterns,
  countIf(properties.is_infra_file = true) as infra_files
FROM events 
WHERE event = 'semantic_scan'
GROUP BY date
ORDER BY date
```

### COSCA Readiness by Team
```sql
-- Average COSCA readiness score by language
SELECT 
  properties.language,
  avg(properties.infra_tag_count + properties.purpose_tags + properties.expiry_tags + properties.owner_tags) as avg_readiness,
  count() as scans
FROM events 
WHERE event = 'semantic_scan'
GROUP BY properties.language
ORDER BY avg_readiness DESC
```

### Purpose-Driven Infrastructure Adoption
```sql
-- Track adoption of purpose-driven metadata
SELECT 
  toStartOfWeek(timestamp) as week,
  countIf(properties.has_purpose_metadata = true) as files_with_purpose,
  count() as total_files,
  (files_with_purpose / total_files) * 100 as adoption_percentage
FROM events 
WHERE event = 'semantic_scan'
GROUP BY week
ORDER BY week
```

## 🔒 Privacy & Security

### Data Collected (Same as Cloud)
- Programming language types
- Semantic pattern counts
- Infrastructure readiness metrics
- Anonymous session identifiers

### Data NOT Collected
- ❌ Source code content
- ❌ File names or paths
- ❌ Personal information
- ❌ Company/project names

### Security Best Practices
- **HTTPS Only**: Always use HTTPS for your PostHog instance
- **Network Isolation**: Run PostHog in a private network
- **Access Control**: Limit who can access PostHog dashboards
- **Regular Updates**: Keep PostHog updated for security patches

## 🛠️ Advanced Configuration

### Custom Event Properties
Add team-specific metadata:

```json
{
  "semanticTagging.customProperties": {
    "team": "platform-engineering",
    "environment": "production",
    "region": "us-west-2"
  }
}
```

### Batch Configuration
Optimize for high-volume teams:

```json
{
  "semanticTagging.telemetryBatchSize": 50,
  "semanticTagging.telemetryFlushInterval": 30000
}
```

## 📈 Team Insights Examples

### 1. Infrastructure Maturity Dashboard
Track how your team adopts infrastructure best practices:
- Purpose-driven metadata coverage
- Infrastructure pattern density
- COSCA readiness trends

### 2. Language-Specific Analytics
Understand patterns by technology:
- Terraform vs Kubernetes adoption
- JavaScript vs Python infrastructure patterns
- Cloud provider preferences

### 3. Developer Productivity Metrics
Measure semantic tagging impact:
- Time to add purpose metadata
- Infrastructure pattern consistency
- Technical debt reduction (TODO/FIXME trends)

## 🆘 Troubleshooting

### Extension Not Connecting
1. **Check PostHog URL**: Ensure it's accessible from developer machines
2. **Verify API Key**: Must start with `phc_` and be from correct project
3. **Network Access**: Check firewalls and VPN configurations
4. **HTTPS Certificate**: Ensure valid SSL certificate

### No Data Appearing
1. **Enable Telemetry**: Must be explicitly enabled in settings
2. **Check Console**: Look for telemetry messages in VSCode Developer Tools
3. **PostHog Logs**: Check PostHog instance logs for ingestion errors
4. **API Key Permissions**: Ensure key has ingestion permissions

### Performance Issues
1. **Increase Batch Size**: Reduce network requests
2. **Adjust Flush Interval**: Balance real-time vs performance
3. **PostHog Resources**: Ensure adequate CPU/memory for PostHog
4. **Database Optimization**: Tune ClickHouse for your workload

## 🤝 Support

### Community Support
- **PostHog Slack**: Join the PostHog community
- **GitHub Issues**: Report extension-specific issues
- **Documentation**: PostHog's comprehensive docs

### Enterprise Support
- **PostHog Cloud**: Managed PostHog with enterprise features
- **Professional Services**: PostHog implementation consulting
- **Custom Integrations**: Tailored analytics solutions

---

**🎯 Result**: Your team gets all the benefits of COSCA semantic analysis while maintaining complete control over your telemetry data!

*For questions about self-hosted setup, reach out to the COSCA team or PostHog community.*
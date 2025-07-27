# 🔒 Privacy Policy: "We Track Tag Types, Not Code"

## Our Promise: Complete Transparency

**COSCA Semantic Tagging** is built with privacy-first principles. We believe in being completely transparent about what data we collect and why.

## 📊 What We Collect (Only When You Opt-In)

### Pattern Statistics Only
```json
{
  "language": "terraform",           // Just the file type
  "total_tags": 8,                  // Count of patterns found  
  "tag_counts": {                   // Categories and counts only
    "iac": 3,                       // Found 3 infrastructure patterns
    "purpose": 2,                   // Found 2 purpose tags
    "cloud": 3                      // Found 3 cloud patterns
  },
  "is_infra_file": true,           // Boolean: contains infrastructure
  "has_purpose_metadata": true,     // Boolean: has COSCA metadata
  "session_id": "session_abc123"    // Random session identifier
}
```

### Session Information
- **Anonymous session ID** - Random string, not linked to you
- **Timestamp** - When the scan happened
- **VSCode version** - For compatibility tracking

## ❌ What We NEVER Collect

### Your Code is Private
- ✅ We see: "Found 3 purpose tags"
- ❌ We never see: `purpose = "user_database"`

### Your Files are Private  
- ✅ We see: "Scanned terraform file"
- ❌ We never see: `main.tf` or `/path/to/file`

### Your Identity is Private
- ❌ No names, emails, or usernames
- ❌ No IP addresses or location data
- ❌ No company or project names
- ❌ No authentication tokens
- ❌ No personal identifiable information

### Your Infrastructure is Private
- ✅ We see: "Found AWS pattern"
- ❌ We never see: `aws_s3_bucket "my-secret-bucket"`

## 🎯 Why We Collect This Data

### Improve Pattern Detection
- Learn which infrastructure patterns are most common
- Enhance semantic analysis accuracy
- Add support for new frameworks and tools

### Build Better COSCA Tools
- Understand how teams adopt purpose-driven infrastructure
- Focus development on most-used patterns
- Improve COSCA readiness scoring

### Help the Community
- Share anonymized insights about infrastructure trends
- Contribute to open source infrastructure tooling
- Support the purpose-driven infrastructure movement

## 🔧 Your Control

### Opt-In Only
- **Telemetry is disabled by default**
- You must explicitly enable it in VSCode settings
- No data is collected unless you choose to share it

### Easy to Disable
```json
// VSCode Settings
{
  "semanticTagging.enableTelemetry": false
}
```

### Self-Hosted Option
Teams can use their own PostHog instance:
```json
{
  "semanticTagging.telemetryHost": "https://your-posthog.company.com",
  "semanticTagging.telemetryApiKey": "your-team-api-key"
}
```

## 📋 Data Retention & Sharing

### Retention
- Data is retained according to PostHog's standard policy
- No long-term storage of personal data (because we don't collect any)
- Session IDs are rotated regularly

### Sharing
- Data is **not shared** with third parties
- Only used by COSCA team to improve the product
- May be used for anonymized research and insights

### Security
- All data transmission is encrypted (HTTPS)
- PostHog provides enterprise-grade security
- No sensitive data is transmitted

## 🌟 Open Source Transparency

### Full Schema Available
- Complete telemetry schema: [`telemetry-schema.json`](telemetry-schema.json)
- All collected fields documented
- JSON Schema validation for accuracy

### Source Code Inspection
- Telemetry code is open source
- Review exactly what data is sent: [`src/telemetry.ts`](src/telemetry.ts)
- No hidden data collection

### Community Oversight
- Report privacy concerns via GitHub issues
- Community can audit all telemetry code
- Transparent development process

## 📞 Contact & Questions

### Have Questions?
- **GitHub Issues**: [Report privacy concerns](https://github.com/coscatech/semantic-tags-plugin/issues)
- **Email**: dev@cosca.tech
- **Documentation**: Full telemetry schema available in repository

### Request Data Deletion
While we don't collect personal data, you can request deletion of any session data by contacting us with your approximate usage timeframe.

---

**Last Updated**: January 26, 2025  
**Version**: 1.0.0

*COSCA is committed to privacy-first development. This policy will be updated if our data collection practices change, with clear notification to users.*
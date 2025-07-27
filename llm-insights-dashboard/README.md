# COSCA Semantic Insights Dashboard

An AI-powered dashboard that analyzes semantic tagging telemetry from PostHog and provides intelligent recommendations for code quality, security, architecture, and developer productivity.

## 🚀 Features

### Core Analytics
- **Real-time Insights**: AI-powered analysis of semantic tagging patterns
- **Executive Summaries**: High-level health scores and key metrics
- **Trend Analysis**: Historical data visualization and pattern recognition
- **Multi-dimensional Scoring**: Security, architecture, productivity, and technical debt scores

### AI-Powered Recommendations
- **Code Quality**: Actionable suggestions for improving code quality
- **Security Analysis**: Vulnerability detection and security recommendations
- **Architecture Insights**: Architectural pattern analysis and improvement suggestions
- **Productivity Optimization**: Developer workflow and efficiency recommendations
- **Technical Debt Management**: Debt identification and reduction strategies
- **Personalized Recommendations**: User-specific suggestions based on coding patterns

### Alerting & Monitoring
- **Smart Alerts**: Automated alerts for critical issues and threshold breaches
- **Multi-channel Notifications**: Email and Slack integration
- **Configurable Thresholds**: Customizable alert conditions
- **Alert Prioritization**: Severity-based alert classification

### Reporting
- **Executive Reports**: Comprehensive PDF and HTML reports
- **ROI Analysis**: Cost-benefit analysis of recommendations
- **Trend Reports**: Historical analysis and forecasting
- **Custom Timeframes**: Flexible reporting periods

## 📋 Prerequisites

- Node.js 16+ 
- PostHog account (cloud or self-hosted)
- OpenAI API key
- Optional: SMTP server for email alerts
- Optional: Slack workspace for notifications

## 🛠️ Installation

1. **Clone and setup**:
   ```bash
   cd llm-insights-dashboard
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Required environment variables**:
   ```env
   POSTHOG_API_KEY=your_posthog_api_key
   POSTHOG_HOST=https://app.posthog.com
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the dashboard**:
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

5. **Access the dashboard**:
   - Dashboard: http://localhost:3000
   - API: http://localhost:3000/api
   - Health check: http://localhost:3000/health

## 🔧 Configuration

### PostHog Setup
The dashboard expects semantic tagging events with this structure:
```javascript
{
  event: 'semantic_tag_detected',
  properties: {
    tag_type: 'infrastructure_pattern',
    pattern_name: 'database_connection',
    file_path: 'src/db/connection.ts',
    language: 'typescript',
    complexity: 'medium',
    // ... other semantic properties
  }
}
```

### Alert Configuration
Configure alert thresholds in your `.env`:
```env
CRITICAL_SECURITY_THRESHOLD=1
HIGH_PRIORITY_RECOMMENDATIONS_THRESHOLD=3
TECHNICAL_DEBT_THRESHOLD=30
PRODUCTIVITY_DROP_THRESHOLD=20
ERROR_RATE_INCREASE_THRESHOLD=50
```

### Email Alerts
For email notifications:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ALERT_EMAIL=admin@yourcompany.com
```

### Slack Alerts
For Slack notifications:
```env
SLACK_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL=#alerts
```

## 📊 API Endpoints

### Core Data
- `GET /api/insights/latest` - Latest AI insights
- `GET /api/insights/generate` - Generate fresh insights
- `GET /api/data/raw?timeframe=7d` - Raw telemetry data

### Recommendations
- `GET /api/recommendations/code-quality` - Code quality recommendations
- `GET /api/recommendations/security` - Security analysis
- `GET /api/recommendations/architecture` - Architecture insights
- `GET /api/recommendations/productivity` - Productivity analysis
- `GET /api/recommendations/technical-debt` - Technical debt analysis
- `GET /api/recommendations/personalized/:userId` - Personalized recommendations

### Alerts & Reports
- `GET /api/alerts/check` - Check and send alerts
- `GET /api/reports/executive-summary` - Executive summary
- `GET /api/reports/detailed?format=pdf` - Detailed report (PDF/HTML)

### Health & Status
- `GET /health` - Service health check

## 🤖 AI Analysis Types

### Code Quality Analysis
- Pattern complexity analysis
- Best practice adherence
- Code maintainability scoring
- Refactoring opportunities

### Security Analysis
- Vulnerability pattern detection
- Authentication/authorization analysis
- Data handling security review
- API security assessment

### Architecture Analysis
- Design pattern identification
- Architectural debt detection
- Scalability assessment
- Integration pattern analysis

### Productivity Analysis
- Development velocity tracking
- Error resolution patterns
- Learning curve analysis
- Collaboration effectiveness

### Technical Debt Analysis
- Debt accumulation trends
- Maintenance burden assessment
- Legacy pattern identification
- Refactoring prioritization

## 📈 Dashboard Features

### Main Dashboard
- Overall health score
- Key performance indicators
- Real-time metrics
- Alert status

### Recommendations Tab
- Prioritized action items
- Implementation guidance
- Impact assessment
- Resource requirements

### Insights Tab
- AI-generated analysis
- Pattern recognition
- Trend predictions
- Anomaly detection

### Trends Tab
- Historical data visualization
- Performance trends
- Comparative analysis
- Forecasting

### Alerts Tab
- Active alerts
- Alert history
- Severity classification
- Resolution tracking

## 🔒 Security & Privacy

- **Data Privacy**: Respects PostHog privacy settings
- **Secure Communication**: HTTPS/TLS encryption
- **API Security**: Rate limiting and authentication
- **Data Retention**: Configurable data retention policies
- **Audit Logging**: Comprehensive activity logging

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t cosca-insights-dashboard .

# Run container
docker run -p 3000:3000 --env-file .env cosca-insights-dashboard
```

### Production Considerations
- Use process manager (PM2, systemd)
- Configure reverse proxy (nginx)
- Set up SSL/TLS certificates
- Configure log rotation
- Set up monitoring and alerting
- Use production database (PostgreSQL)

## 🧪 Development

### Running Tests
```bash
npm test
```

### Code Quality
```bash
npm run lint
```

### Development Mode
```bash
npm run dev
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**Dashboard not loading data**:
- Check PostHog API key and host
- Verify semantic tagging events are being sent
- Check network connectivity

**AI insights not generating**:
- Verify OpenAI API key
- Check API rate limits
- Review error logs

**Alerts not sending**:
- Verify SMTP/Slack configuration
- Check alert thresholds
- Review service health

### Debug Mode
```bash
NODE_ENV=development LOG_LEVEL=debug npm start
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

- Documentation: [Link to docs]
- Issues: [GitHub Issues]
- Discussions: [GitHub Discussions]
- Email: support@cosca.dev

---

Built with ❤️ by the COSCA team for better code analysis and developer productivity.
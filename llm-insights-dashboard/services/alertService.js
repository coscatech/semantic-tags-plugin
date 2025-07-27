const nodemailer = require('nodemailer');
const { WebClient } = require('@slack/web-api');

class AlertService {
    constructor(posthogService, recommendationService) {
        this.posthogService = posthogService;
        this.recommendationService = recommendationService;
        
        // Email setup
        this.emailTransporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Slack setup
        this.slackClient = process.env.SLACK_TOKEN ? 
            new WebClient(process.env.SLACK_TOKEN) : null;

        this.alertThresholds = {
            criticalSecurityIssues: 1,
            highPriorityRecommendations: 3,
            technicalDebtScore: 30,
            productivityDrop: 20,
            errorRateIncrease: 50
        };
    }

    async checkAndSendAlerts() {
        try {
            const alerts = await this.generateAlerts();
            
            for (const alert of alerts) {
                await this.sendAlert(alert);
            }

            return alerts;
        } catch (error) {
            console.error('Error checking and sending alerts:', error);
            throw error;
        }
    }

    async generateAlerts() {
        const alerts = [];

        try {
            // Check security recommendations
            const securityRecs = await this.recommendationService.generateSecurityRecommendations();
            const criticalSecurity = securityRecs.recommendations.filter(r => r.severity === 'critical');
            
            if (criticalSecurity.length >= this.alertThresholds.criticalSecurityIssues) {
                alerts.push({
                    type: 'security',
                    severity: 'critical',
                    title: `${criticalSecurity.length} Critical Security Issues Detected`,
                    description: `Critical security vulnerabilities found in semantic analysis`,
                    details: criticalSecurity,
                    action: 'Immediate review and remediation required'
                });
            }

            // Check technical debt
            const debtAnalysis = await this.recommendationService.generateTechnicalDebtAnalysis();
            if (debtAnalysis.debtScore <= this.alertThresholds.technicalDebtScore) {
                alerts.push({
                    type: 'technical-debt',
                    severity: 'high',
                    title: `Technical Debt Score Critical: ${debtAnalysis.debtScore}`,
                    description: 'Technical debt has reached critical levels',
                    details: debtAnalysis.analysis.filter(a => a.debtLevel === 'critical'),
                    action: 'Strategic debt reduction plan needed'
                });
            }

            // Check productivity trends
            const productivityInsights = await this.recommendationService.generateDeveloperProductivityInsights();
            if (productivityInsights.productivityScore <= (100 - this.alertThresholds.productivityDrop)) {
                alerts.push({
                    type: 'productivity',
                    severity: 'medium',
                    title: `Developer Productivity Decline: ${productivityInsights.productivityScore}%`,
                    description: 'Significant drop in developer productivity metrics',
                    details: productivityInsights.trends.concerning,
                    action: 'Review development processes and tooling'
                });
            }

            // Check code quality trends
            const qualityRecs = await this.recommendationService.generateCodeQualityRecommendations();
            const highPriorityRecs = qualityRecs.recommendations.filter(r => r.priority === 'high');
            
            if (highPriorityRecs.length >= this.alertThresholds.highPriorityRecommendations) {
                alerts.push({
                    type: 'code-quality',
                    severity: 'medium',
                    title: `${highPriorityRecs.length} High-Priority Code Quality Issues`,
                    description: 'Multiple high-priority code quality issues detected',
                    details: highPriorityRecs,
                    action: 'Code review and refactoring recommended'
                });
            }

            // Check error rate increases
            const data = await this.posthogService.getSemanticTaggingData('7d');
            const previousData = await this.posthogService.getSemanticTaggingData('14d');
            
            if (data.errorRate && previousData.errorRate) {
                const errorIncrease = ((data.errorRate - previousData.errorRate) / previousData.errorRate) * 100;
                
                if (errorIncrease >= this.alertThresholds.errorRateIncrease) {
                    alerts.push({
                        type: 'error-rate',
                        severity: 'high',
                        title: `Error Rate Spike: +${errorIncrease.toFixed(1)}%`,
                        description: 'Significant increase in semantic tagging errors',
                        details: data.errorPatterns,
                        action: 'Investigate error patterns and root causes'
                    });
                }
            }

        } catch (error) {
            console.error('Error generating alerts:', error);
        }

        return alerts;
    }

    async sendAlert(alert) {
        try {
            // Send email alert
            if (process.env.ALERT_EMAIL) {
                await this.sendEmailAlert(alert);
            }

            // Send Slack alert
            if (this.slackClient && process.env.SLACK_CHANNEL) {
                await this.sendSlackAlert(alert);
            }

            // Log alert
            console.log(`🚨 Alert sent: ${alert.title}`);
        } catch (error) {
            console.error('Error sending alert:', error);
        }
    }

    async sendEmailAlert(alert) {
        const severityEmoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
        };

        const emailHtml = `
        <h2>${severityEmoji[alert.severity]} COSCA Semantic Analysis Alert</h2>
        <h3>${alert.title}</h3>
        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Description:</strong> ${alert.description}</p>
        <p><strong>Recommended Action:</strong> ${alert.action}</p>
        
        <h4>Details:</h4>
        <pre>${JSON.stringify(alert.details, null, 2)}</pre>
        
        <hr>
        <p><small>Generated by COSCA Semantic Insights Dashboard at ${new Date().toISOString()}</small></p>
        `;

        await this.emailTransporter.sendMail({
            from: process.env.SMTP_FROM || 'alerts@cosca.dev',
            to: process.env.ALERT_EMAIL,
            subject: `[COSCA Alert] ${alert.title}`,
            html: emailHtml
        });
    }

    async sendSlackAlert(alert) {
        const severityColor = {
            critical: '#FF0000',
            high: '#FF8C00',
            medium: '#FFD700',
            low: '#00FF00'
        };

        const blocks = [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `🚨 ${alert.title}`
                }
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Type:* ${alert.type}`
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Severity:* ${alert.severity}`
                    }
                ]
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Description:* ${alert.description}`
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Recommended Action:* ${alert.action}`
                }
            }
        ];

        await this.slackClient.chat.postMessage({
            channel: process.env.SLACK_CHANNEL,
            blocks: blocks,
            attachments: [
                {
                    color: severityColor[alert.severity],
                    fields: [
                        {
                            title: 'Details',
                            value: `\`\`\`${JSON.stringify(alert.details, null, 2)}\`\`\``,
                            short: false
                        }
                    ]
                }
            ]
        });
    }

    async scheduleAlertCheck() {
        // Check for alerts every hour
        setInterval(async () => {
            try {
                await this.checkAndSendAlerts();
            } catch (error) {
                console.error('Scheduled alert check failed:', error);
            }
        }, 60 * 60 * 1000); // 1 hour
    }

    isHealthy() {
        return true; // Basic health check
    }
}

module.exports = AlertService;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportService {
    constructor(posthogService, recommendationService, insightsService) {
        this.posthogService = posthogService;
        this.recommendationService = recommendationService;
        this.insightsService = insightsService;
        
        // Ensure reports directory exists
        this.reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    async generateExecutiveSummary(timeframe = '30d') {
        try {
            const [
                insights,
                securityRecs,
                architecturalInsights,
                productivityInsights,
                debtAnalysis,
                rawData
            ] = await Promise.all([
                this.insightsService.generateInsights(),
                this.recommendationService.generateSecurityRecommendations(timeframe),
                this.recommendationService.generateArchitecturalInsights(timeframe),
                this.recommendationService.generateDeveloperProductivityInsights(timeframe),
                this.recommendationService.generateTechnicalDebtAnalysis(timeframe),
                this.posthogService.getSemanticTaggingData(timeframe)
            ]);

            const summary = {
                reportDate: new Date().toISOString(),
                timeframe,
                executiveSummary: {
                    overallHealth: this.calculateOverallHealth(securityRecs, architecturalInsights, productivityInsights, debtAnalysis),
                    keyMetrics: {
                        totalSemanticTags: rawData.totalTags,
                        securityScore: securityRecs.securityScore,
                        architecturalHealth: architecturalInsights.architecturalHealth.score,
                        productivityScore: productivityInsights.productivityScore,
                        technicalDebtScore: debtAnalysis.debtScore
                    },
                    topPriorities: this.extractTopPriorities(securityRecs, architecturalInsights, productivityInsights, debtAnalysis),
                    trends: this.analyzeTrends(insights, rawData)
                },
                detailedFindings: {
                    security: securityRecs,
                    architecture: architecturalInsights,
                    productivity: productivityInsights,
                    technicalDebt: debtAnalysis
                },
                recommendations: {
                    immediate: this.getImmediateActions(securityRecs, architecturalInsights, productivityInsights, debtAnalysis),
                    shortTerm: this.getShortTermActions(securityRecs, architecturalInsights, productivityInsights, debtAnalysis),
                    longTerm: this.getLongTermActions(securityRecs, architecturalInsights, productivityInsights, debtAnalysis)
                },
                roi: this.calculateROI(securityRecs, architecturalInsights, productivityInsights, debtAnalysis)
            };

            return summary;
        } catch (error) {
            console.error('Error generating executive summary:', error);
            throw error;
        }
    }

    async generateDetailedReport(timeframe = '30d', format = 'json') {
        try {
            const summary = await this.generateExecutiveSummary(timeframe);
            
            if (format === 'pdf') {
                return await this.generatePDFReport(summary);
            } else if (format === 'html') {
                return await this.generateHTMLReport(summary);
            }
            
            return summary;
        } catch (error) {
            console.error('Error generating detailed report:', error);
            throw error;
        }
    }

    async generatePDFReport(summary) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const filename = `cosca-report-${Date.now()}.pdf`;
                const filepath = path.join(this.reportsDir, filename);
                
                doc.pipe(fs.createWriteStream(filepath));

                // Title page
                doc.fontSize(24).text('COSCA Semantic Analysis Report', 50, 50);
                doc.fontSize(14).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 100);
                doc.fontSize(14).text(`Timeframe: ${summary.timeframe}`, 50, 120);

                // Executive Summary
                doc.addPage();
                doc.fontSize(18).text('Executive Summary', 50, 50);
                doc.fontSize(12).text(`Overall Health Score: ${summary.executiveSummary.overallHealth}/100`, 50, 80);
                
                let yPos = 110;
                doc.text('Key Metrics:', 50, yPos);
                yPos += 20;
                
                Object.entries(summary.executiveSummary.keyMetrics).forEach(([key, value]) => {
                    doc.text(`• ${key}: ${value}`, 70, yPos);
                    yPos += 15;
                });

                // Top Priorities
                yPos += 20;
                doc.fontSize(14).text('Top Priorities:', 50, yPos);
                yPos += 20;
                doc.fontSize(12);
                
                summary.executiveSummary.topPriorities.forEach((priority, index) => {
                    doc.text(`${index + 1}. ${priority.title}`, 70, yPos);
                    yPos += 15;
                    doc.text(`   ${priority.description}`, 90, yPos);
                    yPos += 20;
                });

                // Security Section
                doc.addPage();
                doc.fontSize(18).text('Security Analysis', 50, 50);
                doc.fontSize(14).text(`Security Score: ${summary.detailedFindings.security.securityScore}/100`, 50, 80);
                
                yPos = 110;
                summary.detailedFindings.security.recommendations.forEach((rec, index) => {
                    if (yPos > 700) {
                        doc.addPage();
                        yPos = 50;
                    }
                    
                    doc.fontSize(12).text(`${index + 1}. ${rec.title} (${rec.severity})`, 50, yPos);
                    yPos += 15;
                    doc.text(`   ${rec.description}`, 70, yPos);
                    yPos += 25;
                });

                // Architecture Section
                doc.addPage();
                doc.fontSize(18).text('Architectural Analysis', 50, 50);
                doc.fontSize(14).text(`Architecture Health: ${summary.detailedFindings.architecture.architecturalHealth.score}/100`, 50, 80);
                
                yPos = 110;
                summary.detailedFindings.architecture.insights.forEach((insight, index) => {
                    if (yPos > 700) {
                        doc.addPage();
                        yPos = 50;
                    }
                    
                    doc.fontSize(12).text(`${index + 1}. ${insight.title} (${insight.type})`, 50, yPos);
                    yPos += 15;
                    doc.text(`   ${insight.description}`, 70, yPos);
                    yPos += 25;
                });

                // Recommendations
                doc.addPage();
                doc.fontSize(18).text('Recommendations', 50, 50);
                
                yPos = 80;
                ['immediate', 'shortTerm', 'longTerm'].forEach(timeframe => {
                    doc.fontSize(14).text(`${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Actions:`, 50, yPos);
                    yPos += 20;
                    
                    summary.recommendations[timeframe].forEach((action, index) => {
                        if (yPos > 700) {
                            doc.addPage();
                            yPos = 50;
                        }
                        
                        doc.fontSize(12).text(`• ${action}`, 70, yPos);
                        yPos += 15;
                    });
                    yPos += 20;
                });

                doc.end();
                
                doc.on('end', () => {
                    resolve({ filepath, filename });
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    async generateHTMLReport(summary) {
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>COSCA Semantic Analysis Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 20px; }
                .section { margin: 30px 0; }
                .metric { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 5px; }
                .priority { background: #fff3cd; padding: 15px; margin: 10px 0; border-left: 4px solid #ffc107; }
                .recommendation { background: #d4edda; padding: 15px; margin: 10px 0; border-left: 4px solid #28a745; }
                .score { font-size: 24px; font-weight: bold; color: #007bff; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>COSCA Semantic Analysis Report</h1>
                <p>Generated: ${new Date().toLocaleDateString()}</p>
                <p>Timeframe: ${summary.timeframe}</p>
            </div>

            <div class="section">
                <h2>Executive Summary</h2>
                <div class="metric">
                    <strong>Overall Health Score:</strong> 
                    <span class="score">${summary.executiveSummary.overallHealth}/100</span>
                </div>
                
                <h3>Key Metrics</h3>
                <table>
                    <tr><th>Metric</th><th>Score</th></tr>
                    ${Object.entries(summary.executiveSummary.keyMetrics).map(([key, value]) => 
                        `<tr><td>${key}</td><td>${value}</td></tr>`
                    ).join('')}
                </table>

                <h3>Top Priorities</h3>
                ${summary.executiveSummary.topPriorities.map((priority, index) => `
                    <div class="priority">
                        <h4>${index + 1}. ${priority.title}</h4>
                        <p>${priority.description}</p>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Security Analysis</h2>
                <div class="metric">
                    <strong>Security Score:</strong> 
                    <span class="score">${summary.detailedFindings.security.securityScore}/100</span>
                </div>
                
                <h3>Security Recommendations</h3>
                ${summary.detailedFindings.security.recommendations.map(rec => `
                    <div class="recommendation">
                        <h4>${rec.title} (${rec.severity})</h4>
                        <p>${rec.description}</p>
                        <p><strong>Implementation:</strong> ${rec.implementation}</p>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Architectural Analysis</h2>
                <div class="metric">
                    <strong>Architecture Health:</strong> 
                    <span class="score">${summary.detailedFindings.architecture.architecturalHealth.score}/100</span>
                </div>
                
                <h3>Architectural Insights</h3>
                ${summary.detailedFindings.architecture.insights.map(insight => `
                    <div class="recommendation">
                        <h4>${insight.title} (${insight.type})</h4>
                        <p>${insight.description}</p>
                        <p><strong>Recommendations:</strong> ${insight.recommendations.join(', ')}</p>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Recommendations</h2>
                
                <h3>Immediate Actions</h3>
                <ul>
                    ${summary.recommendations.immediate.map(action => `<li>${action}</li>`).join('')}
                </ul>
                
                <h3>Short-term Actions</h3>
                <ul>
                    ${summary.recommendations.shortTerm.map(action => `<li>${action}</li>`).join('')}
                </ul>
                
                <h3>Long-term Actions</h3>
                <ul>
                    ${summary.recommendations.longTerm.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <h2>ROI Analysis</h2>
                <div class="metric">
                    <strong>Estimated Annual Savings:</strong> $${summary.roi.estimatedSavings.toLocaleString()}
                </div>
                <div class="metric">
                    <strong>Implementation Cost:</strong> $${summary.roi.implementationCost.toLocaleString()}
                </div>
                <div class="metric">
                    <strong>ROI:</strong> ${summary.roi.roi}%
                </div>
            </div>
        </body>
        </html>
        `;

        const filename = `cosca-report-${Date.now()}.html`;
        const filepath = path.join(this.reportsDir, filename);
        
        fs.writeFileSync(filepath, html);
        
        return { filepath, filename, html };
    }

    calculateOverallHealth(security, architecture, productivity, debt) {
        const weights = {
            security: 0.3,
            architecture: 0.25,
            productivity: 0.25,
            debt: 0.2
        };

        return Math.round(
            security.securityScore * weights.security +
            architecture.architecturalHealth.score * weights.architecture +
            productivity.productivityScore * weights.productivity +
            debt.debtScore * weights.debt
        );
    }

    extractTopPriorities(security, architecture, productivity, debt) {
        const priorities = [];

        // Critical security issues
        const criticalSecurity = security.recommendations.filter(r => r.severity === 'critical');
        criticalSecurity.forEach(issue => {
            priorities.push({
                title: `Critical Security: ${issue.title}`,
                description: issue.description,
                priority: 1
            });
        });

        // High-impact architectural issues
        const criticalArch = architecture.insights.filter(i => i.type === 'risk' && i.complexity === 'high');
        criticalArch.forEach(issue => {
            priorities.push({
                title: `Architecture Risk: ${issue.title}`,
                description: issue.description,
                priority: 2
            });
        });

        // Critical technical debt
        const criticalDebt = debt.analysis.filter(a => a.debtLevel === 'critical');
        criticalDebt.forEach(issue => {
            priorities.push({
                title: `Technical Debt: ${issue.area}`,
                description: issue.description,
                priority: 3
            });
        });

        return priorities.sort((a, b) => a.priority - b.priority).slice(0, 5);
    }

    analyzeTrends(insights, rawData) {
        return {
            positive: insights.trends?.positive || [],
            concerning: insights.trends?.concerning || [],
            stable: insights.trends?.stable || []
        };
    }

    getImmediateActions(security, architecture, productivity, debt) {
        const actions = [];
        
        // Critical security fixes
        security.recommendations
            .filter(r => r.severity === 'critical')
            .forEach(r => actions.push(`Fix critical security issue: ${r.title}`));
        
        // Quick wins from debt analysis
        debt.recommendations.quickWins?.forEach(win => actions.push(win));
        
        // Immediate productivity improvements
        productivity.recommendations?.immediate?.forEach(rec => actions.push(rec));

        return actions.slice(0, 10);
    }

    getShortTermActions(security, architecture, productivity, debt) {
        const actions = [];
        
        // High priority security items
        security.recommendations
            .filter(r => r.severity === 'high')
            .forEach(r => actions.push(`Address security issue: ${r.title}`));
        
        // Short-term architectural improvements
        architecture.insights
            .filter(i => i.timeline === 'short-term')
            .forEach(i => actions.push(`Architecture: ${i.title}`));

        return actions.slice(0, 10);
    }

    getLongTermActions(security, architecture, productivity, debt) {
        const actions = [];
        
        // Strategic debt reduction
        debt.recommendations.strategic?.forEach(strategy => actions.push(strategy));
        
        // Long-term architectural initiatives
        architecture.insights
            .filter(i => i.timeline === 'long-term')
            .forEach(i => actions.push(`Strategic architecture: ${i.title}`));

        return actions.slice(0, 10);
    }

    calculateROI(security, architecture, productivity, debt) {
        // Simplified ROI calculation based on typical industry metrics
        const securitySavings = security.recommendations.length * 50000; // $50k per security issue prevented
        const debtSavings = (100 - debt.debtScore) * 1000; // $1k per debt point
        const productivitySavings = productivity.productivityScore * 500; // $500 per productivity point
        
        const totalSavings = securitySavings + debtSavings + productivitySavings;
        const implementationCost = totalSavings * 0.3; // Assume 30% implementation cost
        
        return {
            estimatedSavings: totalSavings,
            implementationCost,
            roi: Math.round(((totalSavings - implementationCost) / implementationCost) * 100)
        };
    }

    isHealthy() {
        return fs.existsSync(this.reportsDir);
    }
}

module.exports = ReportService;
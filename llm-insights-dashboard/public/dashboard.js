class COSCADashboard {
    constructor() {
        this.currentTab = 'recommendations';
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.startAutoRefresh();
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadHealthMetrics(),
                this.loadSecurityMetrics(),
                this.loadArchitectureMetrics(),
                this.loadProductivityMetrics(),
                this.loadDebtMetrics(),
                this.loadUsageMetrics(),
                this.loadRecommendations(),
                this.loadInsights(),
                this.checkAlerts()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadHealthMetrics() {
        try {
            const response = await fetch('/api/reports/executive-summary?timeframe=7d');
            const data = await response.json();
            
            const container = document.getElementById('healthMetrics');
            container.innerHTML = `
                <div class="metric">
                    <span>Overall Health</span>
                    <span class="metric-value score ${this.getScoreClass(data.executiveSummary.overallHealth)}">${data.executiveSummary.overallHealth}/100</span>
                </div>
                <div class="metric">
                    <span>Total Semantic Tags</span>
                    <span class="metric-value">${data.executiveSummary.keyMetrics.totalSemanticTags?.toLocaleString() || 'N/A'}</span>
                </div>
                <div class="metric">
                    <span>Top Priority Issues</span>
                    <span class="metric-value">${data.executiveSummary.topPriorities?.length || 0}</span>
                </div>
            `;
        } catch (error) {
            console.error('Error loading health metrics:', error);
            document.getElementById('healthMetrics').innerHTML = '<div class="error">Failed to load health metrics</div>';
        }
    }

    async loadSecurityMetrics() {
        try {
            const response = await fetch('/api/recommendations/security');
            const data = await response.json();
            
            const container = document.getElementById('securityMetrics');
            const criticalIssues = data.recommendations.filter(r => r.severity === 'critical').length;
            const highIssues = data.recommendations.filter(r => r.severity === 'high').length;
            
            container.innerHTML = `
                <div class="metric">
                    <span>Security Score</span>
                    <span class="metric-value score ${this.getScoreClass(data.securityScore)}">${data.securityScore}/100</span>
                </div>
                <div class="metric">
                    <span>Critical Issues</span>
                    <span class="metric-value ${criticalIssues > 0 ? 'score critical' : ''}">${criticalIssues}</span>
                </div>
                <div class="metric">
                    <span>High Priority</span>
                    <span class="metric-value ${highIssues > 0 ? 'score warning' : ''}">${highIssues}</span>
                </div>
            `;
        } catch (error) {
            console.error('Error loading security metrics:', error);
            document.getElementById('securityMetrics').innerHTML = '<div class="error">Failed to load security metrics</div>';
        }
    }

    async loadArchitectureMetrics() {
        try {
            const response = await fetch('/api/recommendations/architecture');
            const data = await response.json();
            
            const container = document.getElementById('architectureMetrics');
            const risks = data.insights.filter(i => i.type === 'risk').length;
            const opportunities = data.insights.filter(i => i.type === 'opportunity').length;
            
            container.innerHTML = `
                <div class="metric">
                    <span>Architecture Health</span>
                    <span class="metric-value score ${this.getScoreClass(data.architecturalHealth.score)}">${data.architecturalHealth.score}/100</span>
                </div>
                <div class="metric">
                    <span>Identified Risks</span>
                    <span class="metric-value ${risks > 0 ? 'score warning' : ''}">${risks}</span>
                </div>
                <div class="metric">
                    <span>Opportunities</span>
                    <span class="metric-value score good">${opportunities}</span>
                </div>
            `;
        } catch (error) {
            console.error('Error loading architecture metrics:', error);
            document.getElementById('architectureMetrics').innerHTML = '<div class="error">Failed to load architecture metrics</div>';
        }
    }

    async loadProductivityMetrics() {
        try {
            const response = await fetch('/api/recommendations/productivity');
            const data = await response.json();
            
            const container = document.getElementById('productivityMetrics');
            container.innerHTML = `
                <div class="metric">
                    <span>Productivity Score</span>
                    <span class="metric-value score ${this.getScoreClass(data.productivityScore)}">${data.productivityScore}/100</span>
                </div>
                <div class="metric">
                    <span>Positive Trends</span>
                    <span class="metric-value score good">${data.trends.positive?.length || 0}</span>
                </div>
                <div class="metric">
                    <span>Areas of Concern</span>
                    <span class="metric-value ${data.trends.concerning?.length > 0 ? 'score warning' : ''}">${data.trends.concerning?.length || 0}</span>
                </div>
            `;
        } catch (error) {
            console.error('Error loading productivity metrics:', error);
            document.getElementById('productivityMetrics').innerHTML = '<div class="error">Failed to load productivity metrics</div>';
        }
    }

    async loadDebtMetrics() {
        try {
            const response = await fetch('/api/recommendations/technical-debt');
            const data = await response.json();
            
            const container = document.getElementById('debtMetrics');
            const criticalDebt = data.analysis.filter(a => a.debtLevel === 'critical').length;
            const highDebt = data.analysis.filter(a => a.debtLevel === 'high').length;
            
            container.innerHTML = `
                <div class="metric">
                    <span>Debt Score</span>
                    <span class="metric-value score ${this.getScoreClass(data.debtScore)}">${data.debtScore}/100</span>
                </div>
                <div class="metric">
                    <span>Critical Areas</span>
                    <span class="metric-value ${criticalDebt > 0 ? 'score critical' : ''}">${criticalDebt}</span>
                </div>
                <div class="metric">
                    <span>High Debt Areas</span>
                    <span class="metric-value ${highDebt > 0 ? 'score warning' : ''}">${highDebt}</span>
                </div>
            `;
        } catch (error) {
            console.error('Error loading debt metrics:', error);
            document.getElementById('debtMetrics').innerHTML = '<div class="error">Failed to load debt metrics</div>';
        }
    }

    async loadUsageMetrics() {
        try {
            const response = await fetch('/api/data/raw?timeframe=7d');
            const data = await response.json();
            
            const container = document.getElementById('usageMetrics');
            container.innerHTML = `
                <div class="metric">
                    <span>Active Users</span>
                    <span class="metric-value">${data.activeUsers || 'N/A'}</span>
                </div>
                <div class="metric">
                    <span>Tags This Week</span>
                    <span class="metric-value">${data.weeklyTags?.toLocaleString() || 'N/A'}</span>
                </div>
                <div class="metric">
                    <span>Error Rate</span>
                    <span class="metric-value ${data.errorRate > 5 ? 'score warning' : 'score good'}">${data.errorRate || 0}%</span>
                </div>
            `;
        } catch (error) {
            console.error('Error loading usage metrics:', error);
            document.getElementById('usageMetrics').innerHTML = '<div class="error">Failed to load usage metrics</div>';
        }
    }

    async loadRecommendations() {
        try {
            const response = await fetch('/api/recommendations/code-quality');
            const data = await response.json();
            
            const container = document.getElementById('codeQualityRecs');
            if (data.recommendations && data.recommendations.length > 0) {
                container.innerHTML = data.recommendations.map(rec => `
                    <div class="recommendation">
                        <h4>${rec.title} <span class="priority ${rec.priority}">${rec.priority}</span></h4>
                        <p>${rec.description}</p>
                        <p><strong>Impact:</strong> ${rec.impact}</p>
                        <p><strong>Implementation:</strong> ${rec.implementation}</p>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p>No recommendations available at this time.</p>';
            }
        } catch (error) {
            console.error('Error loading recommendations:', error);
            document.getElementById('codeQualityRecs').innerHTML = '<div class="error">Failed to load recommendations</div>';
        }
    }

    async loadInsights() {
        try {
            const response = await fetch('/api/insights/latest');
            const data = await response.json();
            
            const container = document.getElementById('aiInsights');
            if (data && data.insights) {
                container.innerHTML = `
                    <div class="recommendation">
                        <h4>🎯 Key Insights</h4>
                        <p>${data.insights.summary || 'No insights available'}</p>
                    </div>
                    <div class="recommendation">
                        <h4>📊 Pattern Analysis</h4>
                        <p>${data.insights.patterns || 'No pattern analysis available'}</p>
                    </div>
                    <div class="recommendation">
                        <h4>🔮 Predictions</h4>
                        <p>${data.insights.predictions || 'No predictions available'}</p>
                    </div>
                `;
            } else {
                container.innerHTML = '<p>No AI insights available. Generate new insights to see analysis.</p>';
            }
        } catch (error) {
            console.error('Error loading insights:', error);
            document.getElementById('aiInsights').innerHTML = '<div class="error">Failed to load insights</div>';
        }
    }

    async checkAlerts() {
        try {
            const response = await fetch('/api/alerts/check');
            const data = await response.json();
            
            const alertBadge = document.getElementById('alertBadge');
            const alertsContainer = document.getElementById('activeAlerts');
            
            if (data.alerts && data.alerts.length > 0) {
                alertBadge.textContent = data.alerts.length;
                alertBadge.style.display = 'inline';
                
                alertsContainer.innerHTML = data.alerts.map(alert => `
                    <div class="recommendation">
                        <h4>${alert.title} <span class="priority ${alert.severity}">${alert.severity}</span></h4>
                        <p><strong>Type:</strong> ${alert.type}</p>
                        <p>${alert.description}</p>
                        <p><strong>Action Required:</strong> ${alert.action}</p>
                    </div>
                `).join('');
            } else {
                alertBadge.style.display = 'none';
                alertsContainer.innerHTML = '<p>✅ No active alerts. System is running smoothly!</p>';
            }
        } catch (error) {
            console.error('Error checking alerts:', error);
            document.getElementById('activeAlerts').innerHTML = '<div class="error">Failed to load alerts</div>';
        }
    }

    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 50) return 'warning';
        return 'critical';
    }

    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data if needed
        if (tabName === 'trends') {
            this.loadTrendsChart();
        }
    }

    async loadTrendsChart() {
        try {
            const response = await fetch('/api/data/raw?timeframe=30d');
            const data = await response.json();
            
            const ctx = document.getElementById('trendsChart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (window.trendsChart) {
                window.trendsChart.destroy();
            }
            
            window.trendsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.timeline?.map(t => new Date(t.date).toLocaleDateString()) || [],
                    datasets: [
                        {
                            label: 'Semantic Tags',
                            data: data.timeline?.map(t => t.tags) || [],
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Error Rate',
                            data: data.timeline?.map(t => t.errorRate) || [],
                            borderColor: '#dc2626',
                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading trends chart:', error);
        }
    }

    startAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadInitialData();
        }, 5 * 60 * 1000);
    }

    showError(message) {
        const container = document.querySelector('.container');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        container.insertBefore(errorDiv, container.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Global functions for button clicks
async function refreshInsights() {
    try {
        const response = await fetch('/api/insights/generate');
        const data = await response.json();
        
        if (data) {
            dashboard.loadInitialData();
            alert('✅ Insights refreshed successfully!');
        }
    } catch (error) {
        console.error('Error refreshing insights:', error);
        alert('❌ Failed to refresh insights');
    }
}

async function generateReport() {
    try {
        window.open('/api/reports/detailed?format=html&timeframe=30d', '_blank');
    } catch (error) {
        console.error('Error generating report:', error);
        alert('❌ Failed to generate report');
    }
}

async function checkAlerts() {
    await dashboard.checkAlerts();
}

function showTab(tabName) {
    dashboard.showTab(tabName);
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new COSCADashboard();
});
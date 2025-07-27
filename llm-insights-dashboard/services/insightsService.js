class InsightsService {
    constructor(posthogService, llmService) {
        this.posthogService = posthogService;
        this.llmService = llmService;
    }

    async generateInsights(timeframe = '7d') {
        try {
            // Get raw data from PostHog
            const rawData = await this.posthogService.getSemanticTaggingData(timeframe);
            
            // Get comparison data for context
            const comparisonTimeframe = this.getComparisonTimeframe(timeframe);
            const comparisonData = await this.posthogService.getSemanticTaggingData(comparisonTimeframe);
            
            // Prepare context for LLM
            const context = {
                timeframe,
                comparison: this.calculateComparison(rawData, comparisonData)
            };

            // Generate AI insights
            const aiInsights = await this.llmService.generateInsights(rawData, context);
            
            // Combine with statistical analysis
            const statisticalInsights = this.generateStatisticalInsights(rawData, comparisonData);
            
            return {
                timestamp: new Date().toISOString(),
                timeframe,
                insights: {
                    ...aiInsights,
                    statistics: statisticalInsights
                },
                rawData: {
                    current: rawData,
                    comparison: comparisonData
                },
                trends: this.analyzeTrends(rawData, comparisonData)
            };
        } catch (error) {
            console.error('Error generating insights:', error);
            throw error;
        }
    }

    getComparisonTimeframe(timeframe) {
        // Map current timeframe to comparison period
        const timeframeMap = {
            '1d': '2d',
            '7d': '14d',
            '30d': '60d',
            '90d': '180d'
        };
        
        return timeframeMap[timeframe] || '14d';
    }

    calculateComparison(current, previous) {
        if (!current || !previous) return null;

        const comparison = {};
        
        // Compare key metrics
        if (current.totalTags && previous.totalTags) {
            comparison.tagsChange = ((current.totalTags - previous.totalTags) / previous.totalTags * 100).toFixed(1);
        }
        
        if (current.errorRate !== undefined && previous.errorRate !== undefined) {
            comparison.errorRateChange = (current.errorRate - previous.errorRate).toFixed(1);
        }
        
        if (current.activeUsers && previous.activeUsers) {
            comparison.usersChange = ((current.activeUsers - previous.activeUsers) / previous.activeUsers * 100).toFixed(1);
        }

        return comparison;
    }

    generateStatisticalInsights(current, previous) {
        const insights = {
            growth: {},
            patterns: {},
            anomalies: []
        };

        // Growth analysis
        if (current.totalTags && previous.totalTags) {
            const growth = ((current.totalTags - previous.totalTags) / previous.totalTags * 100);
            insights.growth.tags = {
                rate: growth.toFixed(1),
                trend: growth > 0 ? 'increasing' : 'decreasing',
                significance: Math.abs(growth) > 20 ? 'high' : Math.abs(growth) > 5 ? 'medium' : 'low'
            };
        }

        // Pattern analysis
        if (current.topPatterns && current.topPatterns.length > 0) {
            insights.patterns.dominant = current.topPatterns[0];
            insights.patterns.diversity = current.topPatterns.length;
            insights.patterns.concentration = this.calculateConcentration(current.topPatterns);
        }

        // Anomaly detection
        if (current.errorRate > 10) {
            insights.anomalies.push({
                type: 'high_error_rate',
                value: current.errorRate,
                severity: current.errorRate > 20 ? 'critical' : 'warning'
            });
        }

        return insights;
    }

    calculateConcentration(patterns) {
        if (!patterns || patterns.length === 0) return 0;
        
        const total = patterns.reduce((sum, pattern) => sum + (pattern.count || 0), 0);
        const topPattern = patterns[0];
        
        return total > 0 ? ((topPattern.count || 0) / total * 100).toFixed(1) : 0;
    }

    analyzeTrends(current, previous) {
        const trends = {
            positive: [],
            concerning: [],
            stable: []
        };

        // Analyze various trend indicators
        if (current.totalTags && previous.totalTags) {
            const change = ((current.totalTags - previous.totalTags) / previous.totalTags * 100);
            
            if (change > 10) {
                trends.positive.push('Semantic tagging usage is increasing');
            } else if (change < -10) {
                trends.concerning.push('Semantic tagging usage is declining');
            } else {
                trends.stable.push('Semantic tagging usage is stable');
            }
        }

        if (current.errorRate !== undefined && previous.errorRate !== undefined) {
            const change = current.errorRate - previous.errorRate;
            
            if (change < -2) {
                trends.positive.push('Error rate is improving');
            } else if (change > 2) {
                trends.concerning.push('Error rate is increasing');
            } else {
                trends.stable.push('Error rate is stable');
            }
        }

        return trends;
    }

    isHealthy() {
        return this.posthogService.isHealthy() && this.llmService.isHealthy();
    }
}

module.exports = InsightsService;
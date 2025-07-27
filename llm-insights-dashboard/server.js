const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const PostHogService = require('./services/posthogService');
const LLMService = require('./services/llmService');
const InsightsService = require('./services/insightsService');
const DatabaseService = require('./services/databaseService');
const RecommendationService = require('./services/recommendationService');
const AlertService = require('./services/alertService');
const ReportService = require('./services/reportService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Services
const posthogService = new PostHogService();
const llmService = new LLMService();
const insightsService = new InsightsService(posthogService, llmService);
const dbService = new DatabaseService();
const recommendationService = new RecommendationService(posthogService, llmService);
const alertService = new AlertService(posthogService, recommendationService);
const reportService = new ReportService(posthogService, recommendationService, insightsService);

// Initialize database
dbService.initialize();

// Routes
app.get('/api/insights/latest', async (req, res) => {
    try {
        const insights = await dbService.getLatestInsights();
        res.json(insights);
    } catch (error) {
        console.error('Error fetching latest insights:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

app.get('/api/insights/generate', async (req, res) => {
    try {
        console.log('🤖 Generating fresh LLM insights...');
        const insights = await insightsService.generateInsights();
        await dbService.saveInsights(insights);
        res.json(insights);
    } catch (error) {
        console.error('Error generating insights:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

app.get('/api/data/raw', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '7d';
        const data = await posthogService.getSemanticTaggingData(timeframe);
        res.json(data);
    } catch (error) {
        console.error('Error fetching raw data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/api/insights/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const history = await dbService.getInsightsHistory(limit);
        res.json(history);
    } catch (error) {
        console.error('Error fetching insights history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Recommendation endpoints
app.get('/api/recommendations/code-quality', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '7d';
        const recommendations = await recommendationService.generateCodeQualityRecommendations(timeframe);
        res.json(recommendations);
    } catch (error) {
        console.error('Error generating code quality recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

app.get('/api/recommendations/architecture', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30d';
        const insights = await recommendationService.generateArchitecturalInsights(timeframe);
        res.json(insights);
    } catch (error) {
        console.error('Error generating architectural insights:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

app.get('/api/recommendations/productivity', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '14d';
        const insights = await recommendationService.generateDeveloperProductivityInsights(timeframe);
        res.json(insights);
    } catch (error) {
        console.error('Error generating productivity insights:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

app.get('/api/recommendations/security', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '7d';
        const recommendations = await recommendationService.generateSecurityRecommendations(timeframe);
        res.json(recommendations);
    } catch (error) {
        console.error('Error generating security recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

app.get('/api/recommendations/technical-debt', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '90d';
        const analysis = await recommendationService.generateTechnicalDebtAnalysis(timeframe);
        res.json(analysis);
    } catch (error) {
        console.error('Error generating technical debt analysis:', error);
        res.status(500).json({ error: 'Failed to generate analysis' });
    }
});

app.get('/api/recommendations/personalized/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const timeframe = req.query.timeframe || '30d';
        const recommendations = await recommendationService.generatePersonalizedRecommendations(userId, timeframe);
        res.json(recommendations);
    } catch (error) {
        console.error('Error generating personalized recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

// Alert endpoints
app.get('/api/alerts/check', async (req, res) => {
    try {
        const alerts = await alertService.checkAndSendAlerts();
        res.json({ alerts, count: alerts.length });
    } catch (error) {
        console.error('Error checking alerts:', error);
        res.status(500).json({ error: 'Failed to check alerts' });
    }
});

// Report endpoints
app.get('/api/reports/executive-summary', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30d';
        const summary = await reportService.generateExecutiveSummary(timeframe);
        res.json(summary);
    } catch (error) {
        console.error('Error generating executive summary:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

app.get('/api/reports/detailed', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '30d';
        const format = req.query.format || 'json';
        const report = await reportService.generateDetailedReport(timeframe, format);
        
        if (format === 'pdf') {
            res.download(report.filepath, report.filename);
        } else if (format === 'html') {
            res.setHeader('Content-Type', 'text/html');
            res.send(report.html);
        } else {
            res.json(report);
        }
    } catch (error) {
        console.error('Error generating detailed report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        services: {
            posthog: posthogService.isHealthy(),
            llm: llmService.isHealthy(),
            database: dbService.isHealthy(),
            recommendations: recommendationService.isHealthy(),
            alerts: alertService.isHealthy(),
            reports: reportService.isHealthy()
        }
    });
});

// Scheduled insight generation (every 6 hours)
cron.schedule('0 */6 * * *', async () => {
    console.log('🕐 Scheduled insight generation starting...');
    try {
        const insights = await insightsService.generateInsights();
        await dbService.saveInsights(insights);
        console.log('✅ Scheduled insights generated successfully');
    } catch (error) {
        console.error('❌ Scheduled insight generation failed:', error);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 COSCA Semantic Insights Dashboard running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    
    // Initialize alert scheduling
    alertService.scheduleAlertCheck();
    console.log('🚨 Alert monitoring started');
    
    // Generate initial insights
    setTimeout(async () => {
        try {
            console.log('🤖 Generating initial insights...');
            const insights = await insightsService.generateInsights();
            await dbService.saveInsights(insights);
            console.log('✅ Initial insights generated');
        } catch (error) {
            console.error('❌ Failed to generate initial insights:', error);
        }
    }, 5000);
});
const OpenAI = require('openai');

class LLMService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.isInitialized = !!process.env.OPENAI_API_KEY;
    }

    async generateInsights(data, context = {}) {
        if (!this.isInitialized) {
            throw new Error('OpenAI API key not configured');
        }

        try {
            const prompt = this.buildInsightsPrompt(data, context);
            
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert code analyst specializing in semantic analysis and developer productivity. Provide actionable insights based on telemetry data.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            });

            return this.parseInsightsResponse(response.choices[0].message.content);
        } catch (error) {
            console.error('Error generating LLM insights:', error);
            throw error;
        }
    }

    buildInsightsPrompt(data, context) {
        return `
        Analyze this semantic tagging telemetry data and provide insights:

        Data Summary:
        - Total semantic tags: ${data.totalTags || 0}
        - Active users: ${data.activeUsers || 0}
        - Error rate: ${data.errorRate || 0}%
        - Top patterns: ${JSON.stringify(data.topPatterns || [])}
        - Recent trends: ${JSON.stringify(data.trends || [])}

        Context:
        - Timeframe: ${context.timeframe || '7d'}
        - Previous period comparison: ${context.comparison || 'N/A'}

        Please provide insights in this JSON format:
        {
            "summary": "Brief overall summary",
            "patterns": "Key patterns identified",
            "predictions": "Future predictions and recommendations",
            "actionItems": ["specific action items"],
            "riskFactors": ["potential risks"],
            "opportunities": ["improvement opportunities"]
        }
        `;
    }

    parseInsightsResponse(response) {
        try {
            return JSON.parse(response);
        } catch (error) {
            // Fallback if JSON parsing fails
            return {
                summary: response,
                patterns: 'Unable to parse detailed patterns',
                predictions: 'Unable to parse predictions',
                actionItems: [],
                riskFactors: [],
                opportunities: []
            };
        }
    }

    isHealthy() {
        return this.isInitialized;
    }
}

module.exports = LLMService;